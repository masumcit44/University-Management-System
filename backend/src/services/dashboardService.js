const Dashboard = require("../models/dashboardModel");

exports.getDashboard = (callback) => {

    Dashboard.getDashboardStats((err, results) => {

        if (err) {
            return callback(err, null);
        }

        const stats = results[0];

        callback(null, stats);

    });

};