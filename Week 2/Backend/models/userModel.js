const db = require("../utils/db");

const createUser = (userData, callback) => {
    const { firstname, lastname, email, mobile, gender, password } = userData;
    const sql = `INSERT INTO users (firstname, lastname, email, mobile, gender, password) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [firstname, lastname, email, mobile, gender, password],callback);
};

const findUserByEmail = (email, callback) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], callback);
};

module.exports = { createUser, findUserByEmail };
