const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = (req, res, next) => {

    // Get Token
    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({

            success: false,
            message: "Access Denied. No Token Provided."

        });

    }

    // Remove Bearer
    const token = authHeader.split(" ")[1];

    let decoded;

    try {

        decoded = jwt.verify(

            token,

            process.env.JWT_SECRET || "mysecretkey"

        );

    } catch (error) {

        return res.status(401).json({

            success: false,
            message: "Invalid Token"

        });

    }

    // Always re-read the account from the database so that role
    // changes, disabled accounts and stale owner links take effect
    // immediately - the JWT only proves "who this was issued to",
    // never "what is true right now".
    User.findUserWithOwner(decoded.user_id, (err, results) => {

        if (err) {

            return res.status(500).json({

                success: false,
                message: "Internal Server Error"

            });

        }

        if (results.length === 0 || Number(results[0].is_active) !== 1) {

            return res.status(401).json({

                success: false,
                message: "Account Disabled or Not Found"

            });

        }

        req.user = results[0];

        next();

    });

};
