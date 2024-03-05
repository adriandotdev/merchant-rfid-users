const RFIDUsersRepository = require("../repository/RFIDUsersRepository");
const Crypto = require("../utils/Crypto");
const { HttpForbidden } = require("../utils/HttpError");

module.exports = class RFIDUsersService {
	#repository;

	constructor() {
		this.#repository = new RFIDUsersRepository();
	}

	async GetRFIDUsers(userID, role) {
		if (role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

		const result = await this.#repository.GetRFIDUsers(userID);

		console.log(result[0]);
		const rfidUsers = result[0].map((user) => {
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
};
