/**
 * This class contains all of the services
 * related to the RFID users for Merchant POV.
 *
 * @CreatedBy Adrian Nads L. Marcelo
 * @LastModified 2024-03-20
 */

const RFIDUsersRepository = require("../repository/RFIDUsersRepository");

// Utilities
const pwGenerator = require("generate-password");
const Crypto = require("../utils/Crypto");
const Email = require("../utils/Email");
const {
	HttpBadRequest,
	HttpInternalServerError,
} = require("../utils/HttpError");

module.exports = class RFIDUsersService {
	/**
	 * @type {RFIDUsersRepository} The repository used for managing RFID users.
	 * @private
	 */
	#repository;

	/**
	 * Creates an instance of RFIDUserHandler.
	 * @constructor
	 */
	constructor() {
		this.#repository = new RFIDUsersRepository();
	}

	/**
	 * Retrieves RFID users based on specified parameters.
	 *
	 * @async
	 * @method
	 * @param {Object} params - Parameters for filtering RFID users.
	 * @param {string} params.user_id - The user ID for filtering.
	 * @param {number} params.limit - The maximum number of users to retrieve.
	 * @param {number} params.offset - The offset for paginating through the results.
	 * @returns {Promise<Array>} A promise that resolves to an array of RFID user objects.
	 * @throws {Error} Throws an error if there is an issue with retrieving RFID users.
	 *
	 * @example
	 * const result = await GetRFIDUsers({
	 *   user_id: '123',
	 *   limit: 10,
	 *   offset: 0
	 * });
	 * console.log(result);
	 * // Output: [{ id: '123', name: 'John Doe', ... }, { id: '456', name: 'Jane Smith', ... }, ...]
	 */
	async GetRFIDUsers({ user_id, limit, offset }) {
		const result = await this.#repository.GetRFIDUsers({
			user_id,
			limit,
			offset,
		});

		const rfidUsers = result.map((user) => {
			return {
				...user,
				name: Crypto.Decrypt(user.name),
				address: Crypto.Decrypt(user.address),
				email: Crypto.Decrypt(user.email),
				mobile_number: Crypto.Decrypt(user.mobile_number),
			};
		});

		return rfidUsers;
	}

	/**
	 * Filter RFID users based on RFID tag or contact number.
	 *
	 * @async
	 * @method
	 * @param {Object} params Parameters for filtering RFID users.
	 * @param {number} params.user_id User ID to determine which RFID users to filter.
	 * @param {string} params.filter Value to be used for filtering.
	 * @param {number} params.limit Number of RFID users to return.
	 * @param {number} params.offset Start number of the row to be returned.
	 *
	 * @returns {Promise<Array>}
	 *
	 * @throws {HttpInternalServerError}
	 */
	async FilterRFIDUsers({ user_id, filter, limit, offset }) {
		const result = await this.#repository.FilterRFIDUserByRFIDOrContactNumber({
			user_id,
			filter,
			limit,
			offset,
		});

		const rfidUsers = result.map((user) => {
			return {
				...user,
				name: Crypto.Decrypt(user.name),
				address: Crypto.Decrypt(user.address),
				email: Crypto.Decrypt(user.email),
				mobile_number: Crypto.Decrypt(user.mobile_number),
			};
		});

		return rfidUsers;
	}

	/**
	 * Add new RFID account based on the rfid card tag provided.
	 *
	 * @async
	 * @method
	 * @param {Object} data
	 * @param {number} data.id ID of the merchant creating the new RFID account.
	 * @param {string} data.name Name of the RFID user.
	 * @param {string} data.address Address of the RFID user.
	 * @param {string} data.email_address Email address of the RFID user.
	 * @param {string} data.mobile_number Mobile number of the RFID user.
	 * @param {string} data.vehicle_plate_number Plate number associated to user.
	 * @param {string} data.vehicle_model Vehicle model owned by the user.
	 * @param {string} data.username Username for the new account
	 * @param {string} data.rfid RFID tag of the user.
	 *
	 * @returns {Promise<Response>}
	 *
	 * @throws {HttpBadRequest} If one of the request body properties is invalid.
	 * @throws {HttpInternalServerError} If there are issues in the server.
	 */
	async AddRFIDAccount(data) {
		const password = pwGenerator.generate({
			length: 8,
			excludeSimilarCharacters: true,
		});

		const accountData = {
			id: data.id,
			name: Crypto.Encrypt(data.name),
			address: Crypto.Encrypt(data.address),
			email_address: Crypto.Encrypt(data.email_address),
			mobile_number: Crypto.Encrypt(data.mobile_number),
			vehicle_plate_number: Crypto.Encrypt(data.vehicle_plate_number),
			vehicle_brand: Crypto.Encrypt(data.vehicle_brand),
			vehicle_model: Crypto.Encrypt(data.vehicle_model),
			username: data.username,
			password,
			rfid: data.rfid,
		};

		const emailSender = new Email(data.email_address, { password });
		const result = await this.#repository.AddRFIDAccount(accountData);

		const STATUS = result[0][0].STATUS;

		const ERRORS = [
			"EXISTING_EMAIL_ADDRESS",
			"EXISTING_MOBILE_NUMBER",
			"EXISTING_PLATE_NUMBER",
			"EXISTING_USERNAME",
			"RFID_DOES_NOT_EXISTS",
			"RFID_ALREADY_OWNED",
		];

		if (ERRORS.includes(STATUS)) throw new HttpBadRequest(STATUS, []);

		if (STATUS !== "SUCCESS") throw new HttpInternalServerError(STATUS, []);

		await emailSender.SendOTP();

		return STATUS;
	}

	/**
	 * Retrieves a user by ID
	 *
	 * @async
	 * @method
	 * @param {Number} cpoOwnerID CPO Owner ID
	 * @param {Number} userID RFID account user ID
	 *
	 * @returns {Object} user
	 */
	async GetUserByID(cpoOwnerID, userID) {
		const data = await this.#repository.GetUserByID(cpoOwnerID, userID);

		if (!data.length || !data[0])
			throw new HttpBadRequest("User ID does not exists");

		const user = {
			id: data[0].id,
			name: Crypto.Decrypt(data[0].name),
			address: Crypto.Decrypt(data[0].address),
			email_address: Crypto.Decrypt(data[0].email_address),
			mobile_number: Crypto.Decrypt(data[0].mobile_number),
			vehicle_plate_number: Crypto.Decrypt(data[0].vehicle_plate_number),
			vehicle_brand: Crypto.Decrypt(data[0].vehicle_brand),
			vehicle_model: Crypto.Decrypt(data[0].vehicle_model),
			username: data[0].username,
			rfid: data[0].rfid,
		};

		return user;
	}

	/**
	 * Update RFID user account by ID
	 *
	 * @async
	 * @method
	 * @param {Object} payload
	 * @param {Number} payload.user_id ID of the RFID user
	 * @param {Object} payload.data User information to be updated
	 *
	 * @returns {String} SUCCESS | NO_CHANGES_APPLIED
	 */
	async UpdateUserByID({ user_id, data }) {
		const VALID_INPUTS = [
			"name",
			"address",
			"email",
			"mobile_number",
			"plate_number",
			"brand",
			"model",
			"username",
		];

		if (!Object.keys(data).every((value) => VALID_INPUTS.includes(value)))
			throw new HttpBadRequest(`Valid inputs are: ${VALID_INPUTS.join(", ")}`);

		if (Object.keys(data).length === 0) {
			// Check if data object is empty
			return "NO_CHANGES_APPLIED";
		}

		let newData = {};

		// Encrypt all of the updated data except the username.
		Object.keys(data).forEach((key) => {
			// DO NOT ENCRYPT property username
			if (key !== "username") newData[key] = Crypto.Encrypt(data[key]);
			else newData[key] = data[key];
		});

		// Setting up the query
		let query = "SET";

		const dataEntries = Object.entries(newData);

		for (const [key, value] of dataEntries) {
			query += ` ${key} = '${value}',`;
		}

		const updateResult = await this.#repository.UpdateUserByID({
			user_id,
			query: query.slice(0, query.length - 1),
		});

		if (updateResult.affectedRows > 0) return "SUCCESS";

		return updateResult;
	}

	/**
	 * Updates RFID account status by ID
	 *
	 * @async
	 * @method
	 * @param {Object} data
	 * @param {String} data.status Account status of the user. Valid status are: ACTIVE | INACTIVE
	 * @param {Number} data.user_id ID of the RFID user to be updated
	 *
	 * @returns {String} SUCCESS | NO_CHANGES_APPLIED
	 *
	 * @throws {HttpBadRequest} When status is invalid
	 */
	async UpdateUserAccountStatusByID({ status, user_id }) {
		const VALID_STATUSES = ["ACTIVE", "INACTIVE"];

		// Check if 'status' is in valid statuses
		if (!VALID_STATUSES.includes(status))
			throw new HttpBadRequest(
				`Valid statuses are: ${VALID_STATUSES.join(", ")}`
			);

		const updateResult = await this.#repository.UpdateUserAccountStatusByID({
			status,
			user_id,
		});

		// Check if there are affected rows
		if (updateResult.affectedRows > 0) return "SUCCESS";

		return "NO_CHANGES_APPLIED";
	}
};
