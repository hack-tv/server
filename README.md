# Hack TV API Documentation

URL: https://hacktv-api.akmalhisyam.my.id

## Endpoints

List of available endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google`

## POST /auth/register

### Request

- Body

```json
{
  "name": "John Doe",
  "imageUrl": "https://i.pravatar.cc/300",
  "email": "john.doe@example.com",
  "password": "12345"
}
```

### Response (201 - Created)

```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "imageUrl": "https://i.pravatar.cc/300"
}
```

### Response (400 - Bad Request)

```json
{
  "message": "Invalid email format"
}
```

OR

```json
{
  "message": "Email already exists"
}
```

## POST /auth/login

### Request

- Body

```json
{
  "email": "john.doe@example.com",
  "password": "12345"
}
```

### Response (200 - OK)

```json
{
  "access_token": "<access_token>"
}
```

### Response (401 - Unauthorized)

```json
{
  "message": "Invalid email or password"
}
```

## GET /auth/google

### Request

- Headers

```json
{
  "token": "<google_token>"
}
```

### Response (200 - OK)

```json
{
  "access_token": "<access_token>"
}
```

## Global Responses

### Response (400 - Bad Request)

```json
{
  "message": "<field_name> is required"
}
```

### Response (401 - Unauthorized)

```json
{
  "message": "Invalid token"
}
```

### Response (403 - Forbidden)

```json
{
  "message": "You are not authorized"
}
```

### Response (404 - Not Found)

```json
{
  "message": "<entity_name> with id <entity_id> is not found"
}
```

### Response (500 - Internal Server Error)

```json
{
  "message": "Internal server error"
}
```
