const mysql = require("../database/mysql");
const Crypto = require("../utils/Crypto");

module.exports = class RFIDUsersRepository {
	GetRFIDUsers({ user_id, limit, offset }) {
		const query = `SELECT ROW_NUMBER() OVER () AS 'row_number', 
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
				query,
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
		return new Promise((resolve, reject) => {
			const query = `SELECT ROW_NUMBER() OVER () AS 'row_number', 
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
			AND rfid_card_tag = '${filter}' OR mobile_number = '${Crypto.Encrypt(filter)}'
			LIMIT ? OFFSET ?`;

			mysql.query(query, [user_id, limit, offset], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
