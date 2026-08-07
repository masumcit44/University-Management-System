const Prediction = require("../models/predictionModel");
const { calculateGrade } = require("./gradeService");

// =======================
// Prediction weights
//
// Continuous assessment is the strongest signal of the final result,
// attendance is a supporting signal. Keeping the weights here means the
// whole model can be tuned from a single place.
// =======================
const ASSESSMENT_WEIGHT = 0.75;
const ATTENDANCE_WEIGHT = 0.25;

// Risk thresholds expressed on the predicted percentage scale
const HIGH_RISK_BELOW = 40;
const MEDIUM_RISK_BELOW = 55;

// A course is only judged reliable when enough evidence exists
const MIN_ASSESSMENTS_FOR_HIGH_CONFIDENCE = 3;
const MIN_CLASSES_FOR_HIGH_CONFIDENCE = 10;

const round = (value, digits = 2) => {
    const factor = Math.pow(10, digits);
    return Math.round(Number(value) * factor) / factor;
};

// =======================
// Attendance rate with Late counted as a half presence
// =======================
const calculateAttendanceRate = (attendance) => {

    if (!attendance || Number(attendance.total_classes) === 0) {
        return null;
    }

    const weightedPresent =
        Number(attendance.present_count) +
        Number(attendance.late_count) * 0.5;

    return round(
        (weightedPresent / Number(attendance.total_classes)) * 100
    );

};

// =======================
// Continuous assessment percentage of a single course
// =======================
const calculateAssessmentPercentage = (course) => {

    const total = Number(course.assessment_total_marks);

    if (!total) {
        return null;
    }

    return round(
        (Number(course.assessment_marks_obtained) / total) * 100
    );

};

// =======================
// How trustworthy a single course prediction is
// =======================
const calculateConfidence = (assessmentCount, totalClasses) => {

    if (
        assessmentCount >= MIN_ASSESSMENTS_FOR_HIGH_CONFIDENCE &&
        totalClasses >= MIN_CLASSES_FOR_HIGH_CONFIDENCE
    ) {
        return "High";
    }

    if (assessmentCount > 0) {
        return "Medium";
    }

    return "Low";

};

const calculateRiskLevel = (percentage) => {

    if (percentage === null) {
        return "Unknown";
    }

    if (percentage < HIGH_RISK_BELOW) {
        return "High";
    }

    if (percentage < MEDIUM_RISK_BELOW) {
        return "Medium";
    }

    return "Low";

};

// =======================
// Predict a single course
//
// A course that already has a Final result is never predicted. The real
// grade is reported instead so the forecast converges to the truth as
// the semester progresses.
// =======================
const predictCourse = (course, attendance) => {

    const attendanceRate = calculateAttendanceRate(attendance);
    const assessmentPercentage = calculateAssessmentPercentage(course);

    const assessmentCount = Number(course.assessment_count) || 0;
    const totalClasses = attendance ? Number(attendance.total_classes) : 0;

    const base = {
        enrollment_id: course.enrollment_id,
        course_id: course.course_id,
        course_code: course.course_code,
        course_name: course.course_name,
        credit: Number(course.credit),
        semester: course.semester,
        session: course.session,
        attendance_rate: attendanceRate,
        total_classes: totalClasses,
        assessment_percentage: assessmentPercentage,
        assessment_count: assessmentCount
    };

    // Final already published - report the actual grade
    if (course.final_grade_point !== null && course.final_grade_point !== undefined) {

        const finalPercentage = Number(course.final_total_marks)
            ? round(
                (Number(course.final_marks_obtained) /
                    Number(course.final_total_marks)) * 100
            )
            : null;

        return {
            ...base,
            is_completed: true,
            final_percentage: finalPercentage,
            predicted_percentage: finalPercentage,
            predicted_grade: course.final_grade_letter,
            predicted_grade_point: Number(course.final_grade_point),
            risk_level: Number(course.final_grade_point) === 0 ? "High" : "Low",
            confidence: "Confirmed"
        };

    }

    // Nothing recorded yet - there is no evidence to predict from
    if (assessmentPercentage === null && attendanceRate === null) {

        return {
            ...base,
            is_completed: false,
            final_percentage: null,
            predicted_percentage: null,
            predicted_grade: null,
            predicted_grade_point: null,
            risk_level: "Unknown",
            confidence: "Low"
        };

    }

    // Weighted prediction. When one signal is missing the other carries
    // the full weight instead of dragging the score down to zero.
    let predictedPercentage;

    if (assessmentPercentage === null) {
        predictedPercentage = attendanceRate;
    } else if (attendanceRate === null) {
        predictedPercentage = assessmentPercentage;
    } else {
        predictedPercentage =
            assessmentPercentage * ASSESSMENT_WEIGHT +
            attendanceRate * ATTENDANCE_WEIGHT;
    }

    predictedPercentage = round(predictedPercentage);

    const { grade, grade_point } = calculateGrade(predictedPercentage);

    return {
        ...base,
        is_completed: false,
        final_percentage: null,
        predicted_percentage: predictedPercentage,
        predicted_grade: grade,
        predicted_grade_point: grade_point,
        risk_level: calculateRiskLevel(predictedPercentage),
        confidence: calculateConfidence(assessmentCount, totalClasses)
    };

};

// =======================
// Plain language reasons and advice driven by the numbers above
// =======================
const buildRecommendations = (courses, overallAttendance) => {

    const recommendations = [];

    if (overallAttendance !== null && overallAttendance < 70) {
        recommendations.push(
            `Overall attendance is ${overallAttendance}%. Attendance below 70% is the strongest early warning of a poor final grade.`
        );
    }

    const failing = courses.filter(
        (c) => !c.is_completed && c.risk_level === "High"
    );

    if (failing.length > 0) {
        recommendations.push(
            `High risk of failing: ${failing
                .map((c) => c.course_code)
                .join(", ")}. Arrange remedial support before the final exam.`
        );
    }

    const borderline = courses.filter(
        (c) => !c.is_completed && c.risk_level === "Medium"
    );

    if (borderline.length > 0) {
        recommendations.push(
            `Borderline performance in ${borderline
                .map((c) => c.course_code)
                .join(", ")}. A strong final exam can still lift these grades.`
        );
    }

    const noData = courses.filter((c) => c.risk_level === "Unknown");

    if (noData.length > 0) {
        recommendations.push(
            `No attendance or assessment records yet for ${noData
                .map((c) => c.course_code)
                .join(", ")}. Prediction accuracy will improve once marks are entered.`
        );
    }

    if (recommendations.length === 0) {
        recommendations.push(
            "Performance is on track across all enrolled courses. Maintain the current attendance and assessment standard."
        );
    }

    return recommendations;

};

// =======================
// Full prediction report for one student
// =======================
exports.getStudentPrediction = (student_id, callback) => {

    Prediction.getStudentProfile(student_id, (err, profileRows) => {

        if (err) {
            return callback(err, null);
        }

        if (profileRows.length === 0) {
            return callback(null, null);
        }

        const student = profileRows[0];

        Prediction.getCoursePerformance(student_id, (err, courseRows) => {

            if (err) {
                return callback(err, null);
            }

            if (courseRows.length === 0) {
                return callback(null, null);
            }

            Prediction.getAttendanceSummary(student_id, (err, attendanceRows) => {

                if (err) {
                    return callback(err, null);
                }

                // Index attendance by enrollment for an O(1) merge
                const attendanceMap = {};

                attendanceRows.forEach((row) => {
                    attendanceMap[row.enrollment_id] = row;
                });

                const courses = courseRows.map((course) =>
                    predictCourse(course, attendanceMap[course.enrollment_id])
                );

                // Credit weighted predicted GPA over every gradeable course
                let weightedPoints = 0;
                let gradedCredits = 0;

                let attendedClasses = 0;
                let weightedPresent = 0;

                courses.forEach((course) => {

                    if (course.predicted_grade_point !== null) {
                        weightedPoints += course.predicted_grade_point * course.credit;
                        gradedCredits += course.credit;
                    }

                    const attendance = attendanceMap[course.enrollment_id];

                    if (attendance && Number(attendance.total_classes) > 0) {
                        attendedClasses += Number(attendance.total_classes);
                        weightedPresent +=
                            Number(attendance.present_count) +
                            Number(attendance.late_count) * 0.5;
                    }

                });

                const predictedGpa = gradedCredits
                    ? round(weightedPoints / gradedCredits)
                    : null;

                const overallAttendance = attendedClasses
                    ? round((weightedPresent / attendedClasses) * 100)
                    : null;

                // The student level risk follows the worst active course
                const activeRisks = courses
                    .filter((c) => !c.is_completed)
                    .map((c) => c.risk_level);

                let overallRisk = "Low";

                if (activeRisks.includes("High")) {
                    overallRisk = "High";
                } else if (activeRisks.includes("Medium")) {
                    overallRisk = "Medium";
                } else if (activeRisks.length === 0) {
                    overallRisk = "Completed";
                } else if (activeRisks.every((r) => r === "Unknown")) {
                    overallRisk = "Unknown";
                }

                callback(null, {
                    student_id: student.student_id,
                    student_name: student.student_name,
                    student_email: student.student_email,
                    department_name: student.department_name,

                    predicted_gpa: predictedGpa,
                    overall_attendance: overallAttendance,
                    overall_risk: overallRisk,

                    total_courses: courses.length,
                    completed_courses: courses.filter((c) => c.is_completed).length,
                    total_credits: round(
                        courses.reduce((sum, c) => sum + c.credit, 0)
                    ),

                    courses,
                    recommendations: buildRecommendations(courses, overallAttendance)
                });

            });

        });

    });

};

// =======================
// Cohort overview - one risk row per student, worst first
// =======================
exports.getCohortPrediction = (callback) => {

    Prediction.getCohortPerformance((err, rows) => {

        if (err) {
            return callback(err, null);
        }

        const students = rows.map((row) => {

            const totalClasses = Number(row.total_classes) || 0;

            const attendanceRate = totalClasses
                ? round((Number(row.weighted_present) / totalClasses) * 100)
                : null;

            const assessmentTotal = Number(row.assessment_total_marks) || 0;

            const assessmentPercentage = assessmentTotal
                ? round(
                    (Number(row.assessment_marks_obtained) / assessmentTotal) * 100
                )
                : null;

            let predictedPercentage = null;

            if (assessmentPercentage !== null && attendanceRate !== null) {
                predictedPercentage = round(
                    assessmentPercentage * ASSESSMENT_WEIGHT +
                    attendanceRate * ATTENDANCE_WEIGHT
                );
            } else if (assessmentPercentage !== null) {
                predictedPercentage = assessmentPercentage;
            } else if (attendanceRate !== null) {
                predictedPercentage = attendanceRate;
            }

            const grade =
                predictedPercentage === null
                    ? null
                    : calculateGrade(predictedPercentage);

            return {
                student_id: row.student_id,
                student_name: row.student_name,
                department_name: row.department_name,
                total_enrollments: Number(row.total_enrollments),
                attendance_rate: attendanceRate,
                assessment_percentage: assessmentPercentage,
                predicted_percentage: predictedPercentage,
                predicted_grade: grade ? grade.grade : null,
                predicted_grade_point: grade ? grade.grade_point : null,
                risk_level: calculateRiskLevel(predictedPercentage)
            };

        });

        // Weakest students first, unknown rows pushed to the bottom
        students.sort((a, b) => {

            if (a.predicted_percentage === null) return 1;
            if (b.predicted_percentage === null) return -1;

            return a.predicted_percentage - b.predicted_percentage;

        });

        callback(null, students);

    });

};