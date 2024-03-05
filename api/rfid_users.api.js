const RFIDUsersService = require("../services/RFIDUsersService");
const logger = require("../config/winston");

// middlewares
const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware");
const { HttpForbidden } = require("../utils/HttpError");

module.exports = (app) => {
	const service = new RFIDUsersService();

	app.get(
		"/admin_rfid/api/v1/users",
		[AccessTokenVerifier],
		async (req, res) => {
			logger.info({ GET_RFID_USERS_API_REQUEST: { message: "SUCCESS" } });

			const { limit, offset } = req.query;

			try {
				if (req.role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

				const result = await service.GetRFIDUsers({
					user_id: req.id,
					limit: limit || 10,
					offset: offset || 0,
				});

				logger.info({ GET_RFID_USERS_API_RESPONSE: { message: "SUCCESS" } });

				res.setHeader(
					"Offset-Link",
					req.protocol + "://" + req.headers.host + "" + req.originalUrl
				);
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

	app.get(
		"/admin_rfid/api/v1/users/search",
		[AccessTokenVerifier],
		async (req, res) => {
			const { user_id, filter, limit, offset } = req.query;

			try {
				if (req.role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

				const result = await service.FilterRFIDUsers({
					user_id: req.id,
					filter,
					limit: limit || 10,
					offset: offset || 0,
				});

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
