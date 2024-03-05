require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const swaggerUI = require("swagger-ui-express");
const app = express();
const YAML = require("yamljs");

// Loggers
const morgan = require("morgan");
const logger = require("./config/winston");

// Global Middlewares
const swaggerDocument = YAML.load("./swagger.yaml");

app.use("/admin_rfid/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use(helmet());
app.use(helmet.frameguard({ action: "deny" }));

app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://v2-stg-parkncharge.sysnetph.com",
		],
		methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE", "PATCH"],
	})
);
app.use(express.urlencoded({ extended: false })); // To parse the urlencoded : x-www-form-urlencoded
app.use(express.json()); // To parse the json()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: logger.stream }));
app.use(cookieParser());

require("./api/rfid_users.api")(app);

app.use("*", (req, res) => {
	logger.error({
		API_NOT_FOUND: {
			api: req.baseUrl,
			status: 404,
		},
	});
	return res.status(404).json({ status: 404, data: [], message: "Not Found" });
});

module.exports = app;
