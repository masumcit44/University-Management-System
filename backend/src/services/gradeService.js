// Calculate Total Marks
exports.calculateTotalMarks = (
    mid_marks,
    assignment_marks,
    quiz_marks,
    final_marks
) => {

    return (
        Number(mid_marks) +
        Number(assignment_marks) +
        Number(quiz_marks) +
        Number(final_marks)
    );

};


// Calculate Grade & Grade Point
exports.calculateGrade = (total) => {

    if (total >= 80)
        return { grade: "A+", grade_point: 4.00 };

    if (total >= 75)
        return { grade: "A", grade_point: 3.75 };

    if (total >= 70)
        return { grade: "A-", grade_point: 3.50 };

    if (total >= 65)
        return { grade: "B+", grade_point: 3.25 };

    if (total >= 60)
        return { grade: "B", grade_point: 3.00 };

    if (total >= 55)
        return { grade: "B-", grade_point: 2.75 };

    if (total >= 50)
        return { grade: "C+", grade_point: 2.50 };

    if (total >= 45)
        return { grade: "C", grade_point: 2.25 };

    if (total >= 40)
        return { grade: "D", grade_point: 2.00 };

    return {
        grade: "F",
        grade_point: 0.00
    };

};