const mysql = require("../database/mysql");

module.exports = class RFIDUsersRepository {
	GetRFIDUsers(userID) {
		const query = `CALL WEB_ADMIN_GET_RFID_USERS(?)`;

		return new Promise((resolve, reject) => {
			mysql.query(query, userID, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
