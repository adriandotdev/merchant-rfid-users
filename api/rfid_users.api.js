const { validationResult, body } = require("express-validator");
const RFIDUsersService = require("../services/RFIDUsersService");
const logger = require("../config/winston");

// middlewares
const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware");
const {
	HttpForbidden,
	HttpUnprocessableEntity,
} = require("../utils/HttpError");

/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
	const service = new RFIDUsersService();

	/**
	 * This function will be used by the express-validator for input validation,
	 * and to be attached to APIs middleware.
	 * @param {*} req
	 * @param {*} res
	 */
	function validate(req, res) {
		const ERRORS = validationResult(req);

		if (!ERRORS.isEmpty()) {
			throw new HttpUnprocessableEntity(
				"Unprocessable Entity",
				ERRORS.mapped()
			);
		}
	}

	app.get(
		"/admin_rfid/api/v1/rfid/accounts",
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
		"/admin_rfid/api/v1/rfid/accounts/search",
		[AccessTokenVerifier],
		async (req, res) => {
			const { filter, limit, offset } = req.query;

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

	app.post(
		"/admin_rfid/api/v1/rfid/accounts",
		[
			AccessTokenVerifier,
			body("name")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: name"),
			body("address")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: address"),
			body("email_address")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: email_address")
				.isEmail()
				.withMessage("Please provide a valid email_address"),
			body("mobile_number")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: mobile_number")
				.custom((value) => String(value).match(/^\b09\d{9}$/)) // example format: 09234412234
				.withMessage(
					"Invalid mobile number. Valid mobile numbers are starting in +63 followed by 10 digits or starting in 09 followed by 9 digits."
				),
			body("vehicle_plate_number")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: vehicle_plate_number")
				.isLength({ min: 7, max: 7 })
				.withMessage("Property vehicle_plate_number must be length of 7")
				.custom((value) => String(value).match(/^[a-zA-Z0-9\-]+$/)) // accepts letters, numbers, and hyphen
				.withMessage(
					"vehicle_plate_number must only consist of letters, numbers, and hyphens"
				),
			body("vehicle_brand")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: vehicle_brand"),
			body("vehicle_model")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: vehicle_model"),
			body("username")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: username"),
			body("rfid")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: rfid")
				.isLength({ min: 12, max: 12 })
				.withMessage("RFID must have a length of 12")
				.custom((value) => String(value).match(/^[A-Z0-9]+$/)) // accepts capital letters and numbers
				.withMessage(
					"Please provide a valid RFID consists of letters or numbers"
				),
		],
		async (req, res) => {
			logger.info({
				ADD_RFID_ACCOUNTS_REQUEST: {
					message: "SUCCESS",
				},
			});

			try {
				validate(req, res);

				const result = await service.AddRFIDAccount({
					id: req.id,
					...req.body,
				});

				logger.info({
					ADD_RFID_ACCOUNTS_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({ ADD_RFID_ACCOUNTS_ERROR: { message: err.message } });

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
