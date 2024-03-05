const RFIDUsersService = require("../services/RFIDUsersService");
const logger = require("../config/winston");

// middlewares
const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware");

module.exports = (app) => {
	const service = new RFIDUsersService();

	app.get(
		"/admin_rfid/api/v1/users",
		[AccessTokenVerifier],
		async (req, res) => {
			logger.info({ GET_RFID_USERS_API_REQUEST: { message: "SUCCESS" } });
			try {
				const result = await service.GetRFIDUsers(req.id, req.role);

				logger.info({ GET_RFID_USERS_API_RESPONSE: { message: "SUCCESS" } });

				return res.status(200).json({ status: 200, data: result });
			} catch (err) {
				logger.error({ GET_RFID_USERS_API_ERROR: { message: err.message } });

				logger.error(err);

				return res.status(err.status || 500).json({
					status: err.status || 500,
					data: err.data || [],
					message: err.message || "Internal Server Error",
				});
			}
		}
	);
};
