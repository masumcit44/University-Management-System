const { getDashboard } = require("../services/dashboardService");

// GET Dashboard
exports.getDashboard = (req, res) => {

    getDashboard((err, stats) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: stats
        });

    });

};