const mysql = require("../database/mysql");
const Crypto = require("../utils/Crypto");

module.exports = class RFIDUsersRepository {
	/**
	 * Retrieves a list of RFID users associated with a specific CPO owner.
	 *
	 * This function fetches RFID user details such as ID, name, address, email, mobile number, balance,
	 * and RFID card tag by joining `user_drivers` and `rfid_cards` tables. It limits the results based
	 * on the provided limit and offset values.
	 *
	 * @function GetRFIDUsers
	 * @param {Object} params - Parameters for retrieving RFID users.
	 * @param {number} params.user_id - The ID of the user.
	 * @param {number} params.limit - The maximum number of records to return.
	 * @param {number} params.offset - The number of records to skip before starting to return records.
	 * @returns {Promise<Object[]>} A promise that resolves to an array of objects, each representing an RFID user.
	 * @property {number} row_number - The row number in the result set.
	 * @property {number} id - The ID of the RFID user.
	 * @property {string} name - The name of the RFID user.
	 * @property {string} address - The address of the RFID user.
	 * @property {string} email - The email of the RFID user.
	 * @property {string} mobile_number - The mobile number of the RFID user.
	 * @property {number} balance - The balance of the RFID user.
	 * @property {string} rfid_number - The RFID card tag of the RFID user.
	 * @throws {Error} If an error occurs during the query execution.
	 */
	GetRFIDUsers({ user_id, limit, offset }) {
		const QUERY = `
			SELECT 
				ROW_NUMBER() OVER () AS 'row_number', 
				user_drivers.id, 
				name, 
				address, 
				email, 
				mobile_number, 
				balance, 
				rfid_card_tag AS rfid_number 
			FROM 
				user_drivers
			INNER JOIN rfid_cards ON rfid_cards.user_driver_id = user_drivers.id
			WHERE 
				user_drivers.cpo_owner_id = (SELECT id FROM cpo_owners WHERE user_id = ?)
			LIMIT ? OFFSET ?
		`;

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

	/**
	 * Filters RFID users by RFID card tag or contact number.
	 *
	 * This function retrieves RFID user details such as ID, name, address, email, mobile number, balance,
	 * and RFID card tag by joining `user_drivers` and `rfid_cards` tables. It applies filters based on
	 * the provided RFID card tag or contact number, and limits the results based on the provided limit
	 * and offset values.
	 *
	 * @function FilterRFIDUserByRFIDOrContactNumber
	 * @param {Object} params - Parameters for filtering RFID users.
	 * @param {number} params.user_id - The ID of the user.
	 * @param {string} params.filter - The filter value for RFID card tag or contact number.
	 * @param {number} params.limit - The maximum number of records to return.
	 * @param {number} params.offset - The number of records to skip before starting to return records.
	 * @returns {Promise<Object[]>} A promise that resolves to an array of objects, each representing a filtered RFID user.
	 * @property {number} row_number - The row number in the result set.
	 * @property {number} id - The ID of the RFID user.
	 * @property {string} name - The name of the RFID user.
	 * @property {string} address - The address of the RFID user.
	 * @property {string} email - The email of the RFID user.
	 * @property {string} mobile_number - The mobile number of the RFID user.
	 * @property {number} balance - The balance of the RFID user.
	 * @property {string} rfid_number - The RFID card tag of the RFID user.
	 * @throws {Error} If an error occurs during the query execution.
	 */
	FilterRFIDUserByRFIDOrContactNumber({ user_id, filter, limit, offset }) {
		const QUERY = `
			SELECT 
				ROW_NUMBER() OVER () AS 'row_number', 
				user_drivers.id, 
				name, 
				address, 
				email, 
				mobile_number, 
				balance, 
				rfid_card_tag AS rfid_number 
			FROM 
				user_drivers
			INNER JOIN rfid_cards ON rfid_cards.user_driver_id = user_drivers.id
			WHERE 
				user_drivers.cpo_owner_id = (SELECT id FROM cpo_owners WHERE user_id = ?)
				AND rfid_card_tag LIKE '${filter}%' OR mobile_number = '${Crypto.Encrypt(
			filter
		)}'
			LIMIT ? OFFSET ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [user_id, limit, offset], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	/**
	 * Adds an RFID account.
	 *
	 * This function calls the stored procedure WEB_ADMIN_ADD_RFID_ACCOUNT to add an RFID account
	 * with the provided data. It accepts an object containing data for the RFID account, including
	 * cpo_owner_id, user_driver_id, rfid_card_tag, status, date_created, and date_modified.
	 *
	 * @function AddRFIDAccount
	 * @param {Object} data - Data for the RFID account.
	 * @param {number} data.cpo_owner_id - The ID of the CPO owner.
	 * @param {number} data.user_driver_id - The ID of the user driver.
	 * @param {string} data.rfid_card_tag - The RFID card tag.
	 * @param {string} data.status - The status of the RFID account.
	 * @param {Date} data.date_created - The date when the RFID account was created.
	 * @param {Date} data.date_modified - The date when the RFID account was last modified.
	 * @returns {Promise<Object>} A promise that resolves to the result of adding the RFID account.
	 * @throws {Error} If an error occurs during the query execution.
	 */
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

	/**
	 * Retrieves user details by user ID under a specific CPO owner.
	 *
	 * This function fetches details of a user, including their name, address, email address,
	 * mobile number, RFID, vehicle plate number, vehicle model, vehicle brand, and username,
	 * based on the provided user ID and CPO owner ID.
	 *
	 * @function GetUserByID
	 * @param {number} cpoOwnerID - The ID of the CPO owner.
	 * @param {number} userID - The ID of the user.
	 * @returns {Promise<Array>} A promise that resolves to an array containing user details.
	 * @throws {Error} If an error occurs during the query execution.
	 */
	GetUserByID(cpoOwnerID, userID) {
		const QUERY = `
		SELECT 
			users.id,
			name,
			address,
			email AS email_address,
			mobile_number,
			rfid_card_tag AS rfid,
			plate_number AS vehicle_plate_number,
			model AS vehicle_model,
			brand AS vehicle_brand,
			username
		FROM 
			users
		INNER JOIN user_drivers ON users.id = user_drivers.user_id
		INNER JOIN user_driver_vehicles ON user_drivers.id = user_driver_vehicles.user_driver_id
		WHERE 
			user_drivers.cpo_owner_id = (SELECT id FROM cpo_owners WHERE user_id = ?)
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

	/**
	 * Updates user details by user ID.
	 *
	 * This function updates user details based on the provided user ID and a custom SQL query.
	 *
	 * @function UpdateUserByID
	 * @param {Object} data - An object containing user ID and a custom SQL query.
	 * @param {number} data.user_id - The ID of the user.
	 * @param {string} data.query - The custom SQL query for updating user details.
	 * @returns {Promise<Object>} A promise that resolves to the result of the update operation.
	 * @throws {Error} If an error occurs during the query execution.
	 */
	UpdateUserByID({ user_id, query }) {
		const QUERY = `
			UPDATE 
				users AS u
			INNER JOIN user_drivers AS ud ON u.id = ud.user_id
			INNER JOIN user_driver_vehicles AS udv ON ud.id = udv.user_driver_id 
			${query} 
			WHERE 
				u.id = ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [user_id], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	/**
	 * Updates user account status by user ID.
	 *
	 * This function updates the account status of a user specified by the user ID.
	 *
	 * @function UpdateUserAccountStatusByID
	 * @param {Object} data - An object containing the new status and the user ID.
	 * @param {string} data.status - The new status to set for the user account.
	 * @param {number} data.user_id - The ID of the user whose account status is to be updated.
	 * @returns {Promise<Object>} A promise that resolves to the result of the update operation.
	 * @throws {Error} If an error occurs during the query execution.
	 */
	UpdateUserAccountStatusByID({ status, user_id }) {
		const QUERY = `
			UPDATE 
				users
			SET 
				user_status = ?, 
				date_modified = NOW()
			WHERE id = ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [status, user_id], (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}
};
