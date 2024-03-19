const mysql = require("../database/mysql");
const Crypto = require("../utils/Crypto");

module.exports = class RFIDUsersRepository {
	GetRFIDUsers({ user_id, limit, offset }) {
		const QUERY = `SELECT ROW_NUMBER() OVER () AS 'row_number', 
		user_drivers.id, 
		name, address, 
		email, 
		mobile_number, 
		balance, 
		rfid_card_tag AS rfid_number 
		FROM user_drivers
		INNER JOIN rfid_cards 
		ON rfid_cards.user_driver_id = user_drivers.id
		WHERE user_drivers.cpo_owner_id = (SELECT id FROM cpo_owners WHERE user_id = ?)
		LIMIT ? OFFSET ?`;

		return new Promise((resolve, reject) => {
			mysql.query(
				QUERY,
				[user_id, parseInt(limit), parseInt(offset)],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	FilterRFIDUserByRFIDOrContactNumber({ user_id, filter, limit, offset }) {
		const QUERY = `SELECT ROW_NUMBER() OVER () AS 'row_number', 
		user_drivers.id, 
		name, address, 
		email, 
		mobile_number, 
		balance, 
		rfid_card_tag AS rfid_number 
		FROM user_drivers
		INNER JOIN rfid_cards 
		ON rfid_cards.user_driver_id = user_drivers.id
		WHERE user_drivers.cpo_owner_id = (SELECT id FROM cpo_owners WHERE user_id = ?)
		AND rfid_card_tag LIKE '${filter}%' OR mobile_number = '${Crypto.Encrypt(
			filter
		)}'
		LIMIT ? OFFSET ?`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [user_id, limit, offset], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	AddRFIDAccount(data) {
		const QUERY = `CALL WEB_ADMIN_ADD_RFID_ACCOUNT(?,?,?,?,?,?,?,?,?,?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [...Object.values(data)], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetUserByID(cpoOwnerID, userID) {
		const QUERY = `SELECT 
			user_drivers.id,
			name,
			address,
			email AS email_address,
			mobile_number,
			rfid_card_tag AS rfid,
			plate_number AS vehicle_plate_number,
			model AS vehicle_model,
			brand AS vehicle_brand,
			username
		FROM users
		INNER JOIN user_drivers
		ON users.id = user_drivers.user_id
		INNER JOIN user_driver_vehicles
		ON user_drivers.id = user_driver_vehicles.user_driver_id
		WHERE user_drivers.cpo_owner_id = (SELECT id FROM cpo_owners WHERE user_id = ?)
		AND users.id = ?
		AND users.role NOT IN ('CPO_OWNER', 'ADMIN');`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [cpoOwnerID, userID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
