const RFIDUsersRepository = require("../repository/RFIDUsersRepository");
const Crypto = require("../utils/Crypto");

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
};
