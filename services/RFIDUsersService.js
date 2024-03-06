const RFIDUsersRepository = require("../repository/RFIDUsersRepository");

// utils
const Crypto = require("../utils/Crypto");
const pwGenerator = require("generate-password");
const Email = require("../utils/Email");
const {
	HttpBadRequest,
	HttpInternalServerError,
} = require("../utils/HttpError");

module.exports = class RFIDUsersService {
	#repository;

	constructor() {
		this.#repository = new RFIDUsersRepository();
	}

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
};
