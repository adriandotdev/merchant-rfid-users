# ParkNcharge Login

# APIs

## Routes

Staging Area URL

```javascript
192.46.227.227:4001
```

## Basic Token

This API will be used to retrieve the basic_token, which will be used in the `First Layer APIs`.

```
GET /api/auth/v1/token
```

### Sample Response

```json
{
	"status": 200,
	"token": "eyJhbGciOiJIUzI1NiJ9.cGFya25jaGFyZ2UtZGV2ZWxvcGVyLWFwaWtleQ.a2HEcaGP6po2yAAV-ieQNHbCoD6nMGDNWs3fGjrGJds"
}
```

# Login

```
POST /api/auth/v1/login
```

### Sample Request Body

```json
{
	"username": "adriannads",
	"password": "adriannads"
}
```

### Authorization Header

> Note: BASIC_TOKEN can be retrieved from this API: /api/auth/v1/token

```
Authorization: Bearer <BASIC_TOKEN>
```

### Sample Response

```json
{
	"status": 200,
	"data": {
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkcmlhbm5hZHMiLCJqdGkiOiJkY2EzZTRmZC1jODdhLTQ3MjEtYTgyNC1hZGYzZTM1NzEwY2UiLCJhdWQiOiJuc3AtdG9rZW4iLCJpc3MiOiJodWItYXV0aC1tb2R1bGUiLCJpYXQiOjE3MDE0MTY4MjQsInR5cCI6IkJlYXJlciIsImV4cCI6MTcwMTQyMDQyNCwidXNyIjoiZG9lIn0.uKMSQRRDARrg98SXnyAYx9_QCtKY8JrKyqQTyvo0rIQ",
		"access_expires_in": 1701420424,
		"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkcmlhbm5hZHMiLCJqdGkiOiJlYjM1YmUxNi1iOWZjLTQ0ZjAtYjMwMi1hNTQ3N2ZhNmMzYjQiLCJhdWQiOiJuc3AtdG9rZW4iLCJpc3MiOiJodWItYXV0aC1tb2R1bGUiLCJpYXQiOjE3MDE0MTY4MjQsInR5cCI6IkJlYXJlciIsImV4cCI6MTcwMTQyMjIyNCwidXNyIjoiZG9lIn0.uprnKB9T_IU6CqIORYl_RgC-k2u-Rnd24oZ2SGtTKwg"
	},
	"message": "SUCCESS"
}
```

# Logout

```
POST /api/auth/v1/logout
```

### Sample Request

Attach the access_token to Authorization header.

> ACCESS_TOKEN can be retrieved in /api/v1/login API

```
Authorization: Bearer <ACCESS_TOKEN>
```

### Sample Response

```json
{
	"status": 200,
	"data": [],
	"message": "Logged out successfully"
}
```

# Refresh Token

```
GET /api/auth/v1/refresh
```

### Sample Request

Attach the REFRESH_TOKEN to the Authorization Header

> REFRESH_TOKEN can be retrieved in /api/v1/login API

```
Authorization: Bearer <REFRESH_TOKEN>
```

### Sample Response

```json
{
	"status": 200,
	"data": {
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkcmlhbm5hZHMiLCJqdGkiOiJkY2EzZTRmZC1jODdhLTQ3MjEtYTgyNC1hZGYzZTM1NzEwY2UiLCJhdWQiOiJuc3AtdG9rZW4iLCJpc3MiOiJodWItYXV0aC1tb2R1bGUiLCJpYXQiOjE3MDE0MTY4MjQsInR5cCI6IkJlYXJlciIsImV4cCI6MTcwMTQyMDQyNCwidXNyIjoiZG9lIn0.uKMSQRRDARrg98SXnyAYx9_QCtKY8JrKyqQTyvo0rIQ",
		"access_expires_in": 1701420424,
		"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkcmlhbm5hZHMiLCJqdGkiOiJlYjM1YmUxNi1iOWZjLTQ0ZjAtYjMwMi1hNTQ3N2ZhNmMzYjQiLCJhdWQiOiJuc3AtdG9rZW4iLCJpc3MiOiJodWItYXV0aC1tb2R1bGUiLCJpYXQiOjE3MDE0MTY4MjQsInR5cCI6IkJlYXJlciIsImV4cCI6MTcwMTQyMjIyNCwidXNyIjoiZG9lIn0.uprnKB9T_IU6CqIORYl_RgC-k2u-Rnd24oZ2SGtTKwg"
	},
	"message": "SUCCESS"
}
```

# Forgot Password

These are the lists of APIs that are included in Forgot Password.

## Sending OTP/Resend OTP

```
POST /api/auth/v1/send-otp
```

Attach the Developer's generated authorization token.

```
Authorization: Bearer <BASIC_TOKEN>
```

### Sample Request Body

```json
{
	"email": "adriannadslaurianomarcelo@gmail.com"
}
```

### Sample Response

```json
{
	"status": 200,
	"data": [
		{
			"USER_ID": 47,
			"STATUS": "NEW_CREATED_RECORD"
		}
	],
	"message": "Success"
}
```

## Verifying OTP

```
POST /api/auth/v1/verify-otp
```

Attach the Developer's generated authorization token.

```
Authorization: Bearer <BASIC_TOKEN>
```

### Sample Request Body

```json
{
	"user_id": 47,
	"otp": 588641
}
```

> The `user_id` in the request body is the id that you've received from the `/api/auth/v1/send-otp` API

### Sample Response

```json
{
	"status": 200,
	"data": "SUCCESS",
	"message": "Success"
}
```

## Change Password

```
POST /api/auth/v1/change-password/:user_id
```

- `user_id` is the id that you have received from the `/api/auth/v1/send-otp` API.

Attach the Developer's generated authorization token.

```
Authorization: Bearer <BASIC_TOKEN>
```

### Sample Request Body

```json
{
	"password": "changeme"
}
```

### Sample Response

```json
{
	"status": 200,
	"data": [
		{
			"status": "PASSWORD_UPDATED"
		}
	],
	"message": "Success"
}
```

# How to Test this Project?

## Test Locally

To test locally, you need to do these few steps:

1. Clone the project.

```
git clone https://repo.sysnetph.com/parkncharge/parkncharge-login.git
```

2. Go inside the folder, and install all of the packages by running this command:

```
npm install
```

3. After you've install all the packages, run the app.

```
npm run dev
```

4. Access the API in `localhost:4001`

## Test In Staging

To test in staging, you can access the API to `192.46.227.227:4001`

> NOTE: You can also see the logs of it by running `docker logs <container_id> -f`
