const { validationResult, body, query, param } = require("express-validator");
const RFIDUsersService = require("../services/RFIDUsersService");
const logger = require("../config/winston");

// middlewares
const TokenMiddleware = require("../middlewares/TokenMiddleware");
const {
	ROLES,
	RoleManagementMiddleware,
} = require("../middlewares/RoleManagementMiddleware");

const {
	HttpForbidden,
	HttpUnprocessableEntity,
	HttpBadRequest,
} = require("../utils/HttpError");

/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
	const service = new RFIDUsersService();
	const tokenMiddleware = new TokenMiddleware();
	const roleMiddleware = new RoleManagementMiddleware();

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
		"/merchant_rfid_users/api/v1/rfid/accounts",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.CPO_OWNER),
		],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res, next) => {
			try {
				const { limit, offset } = req.query;

				logger.info({
					GET_RFID_USERS_API_REQUEST: {
						data: { limit, offset },
						message: "SUCCESS",
					},
				});

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
				req.error_name = "GET_RFID_USERS_API_ERROR";
				next(err);
			}
		}
	);

	app.get(
		"/merchant_rfid_users/api/v1/rfid/accounts/search",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.CPO_OWNER),
			query("filter")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required property: filter"),
		],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res, next) => {
			try {
				const { filter, limit, offset } = req.query;

				logger.info({
					GET_RFID_USERS_API_REQUEST: {
						data: {
							filter,
							limit,
							offset,
						},
						message: "SUCCESS",
					},
				});

				if (req.role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

				const result = await service.FilterRFIDUsers({
					user_id: req.id,
					filter,
					limit: limit || 10,
					offset: offset || 0,
				});

				logger.info({
					GET_RFID_USERS_API_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res.status(200).json({ status: 200, data: result });
			} catch (err) {
				req.error_name = "GET_RFID_USERS_API_ERROR";
				next(err);
			}
		}
	);

	app.post(
		"/merchant_rfid_users/api/v1/rfid/accounts",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.CPO_OWNER),
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
				.custom((value) => String(value).match(/^[A-Z0-9]+$/)) // accepts capital letters and numbers
				.withMessage(
					"Please provide a valid RFID consists of letters or numbers"
				),
		],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res, next) => {
			try {
				logger.info({
					ADD_RFID_ACCOUNTS_REQUEST: {
						message: "SUCCESS",
					},
				});

				if (req.role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

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
				req.error_name = "ADD_RFID_ACCOUNTS_ERROR";
				next(err);
			}
		}
	);

	app.patch(
		"/merchant_rfid_users/api/v1/rfid/accounts/:user_id",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.CPO_OWNER),
			body("name")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: name")
				.escape()
				.trim(),
			body("address")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: address")
				.escape()
				.trim(),
			body("email")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: email_address")
				.escape()
				.trim()
				.isEmail()
				.withMessage("Please provide a valid email_address"),
			body("mobile_number")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: mobile_number")
				.escape()
				.trim()
				.custom((value) => String(value).match(/^\b09\d{9}$/)) // example format: 09234412234
				.withMessage(
					"Invalid mobile number. Valid mobile numbers is starting in 09 followed by 9 digits."
				),
			body("plate_number")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: vehicle_plate_number")
				.escape()
				.trim()
				.isLength({ min: 7, max: 7 })
				.withMessage("Property vehicle_plate_number must be length of 7")
				.custom((value) => String(value).match(/^[a-zA-Z0-9\-]+$/)) // accepts letters, numbers, and hyphen
				.withMessage(
					"vehicle_plate_number must only consist of letters, numbers, and hyphens"
				),
			body("brand")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: vehicle_brand")
				.escape()
				.trim(),
			body("model")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: vehicle_model")
				.escape()
				.trim(),
			body("username")
				.optional()
				.notEmpty()
				.withMessage("Missing required property: username")
				.escape()
				.trim(),
		],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res, next) => {
			try {
				logger.info({
					UPDATE_RFID_USER_BY_ID: {
						data: {
							...req.params,
							...req.body,
						},
						message: "SUCCESS",
					},
				});

				if (req.role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

				validate(req, res);

				const { user_id } = req.params;
				const data = req.body;

				const result = await service.UpdateUserByID({
					user_id,
					data,
				});

				logger.info({
					UPDATE_RFID_USER_BY_ID: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				req.error_name = "UPDATE_RFID_USER_BY_ID_ERROR";
				next(err);
			}
		}
	);

	app.get(
		"/merchant_rfid_users/api/v1/rfid/accounts/:user_id",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.CPO_OWNER),
			param("user_id")
				.notEmpty()
				.escape()
				.trim()
				.withMessage("Missing required parameter: user_id"),
		],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res, next) => {
			const { user_id } = req.params;

			logger.info({
				GET_RFID_USER_BY_ID_REQUEST: {
					data: {
						user_id,
					},
					message: "SUCCESS",
				},
			});

			try {
				if (req.role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

				validate(req, res);

				if (!user_id)
					throw new HttpBadRequest("Missing required parameter: user_id");

				const user = await service.GetUserByID(req.id, user_id);

				logger.info({
					GET_RFID_USER_BY_ID_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: user, message: "Success" });
			} catch (err) {
				req.error_name = "GET_RFID_USER_BY_ID_ERROR";
				next(err);
			}
		}
	);

	app.patch(
		"/merchant_rfid_users/api/v1/rfid/accounts/:status/:user_id",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.CPO_OWNER),
			param("status")
				.notEmpty()
				.withMessage("Missing required property: status"),
		],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res, next) => {
			try {
				logger.info({
					UPDATE_RFID_USER_STATUS: {
						status: req.params.status,
						user_id: req.params.user_id,
					},
				});

				if (req.role !== "CPO_OWNER") throw new HttpForbidden("Forbidden", []);

				const { status, user_id } = req.params;

				const result = await service.UpdateUserAccountStatusByID({
					status,
					user_id,
				});

				logger.info({
					UPDATE_RFID_USER_STATUS_RESPONSE: { message: "SUCCESS" },
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				req.error_name = "UPDATE_RFID_USER_STATUS_ERROR";
				next(err);
			}
		}
	);

	app.use((err, req, res, next) => {
		logger.error({
			API_REQUEST_ERROR: {
				error_name: req.error_name || "UNKNOWN_ERROR",
				message: err.message,
				stack: err.stack.replace(/\\/g, "/"), // Include stack trace for debugging
				request: {
					method: req.method,
					url: req.url,
					code: err.status || 500,
				},
				data: err.data || [],
			},
		});

		const status = err.status || 500;
		const message = err.message || "Internal Server Error";

		res.status(status).json({
			status,
			data: err.data || [],
			message,
		});
	});
};
