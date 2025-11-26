# EasyOrder REST API Documentation

EasyOrder is a REST API developed for restaurant management systems.

## Table of Contents

- [Overview](#overview)
  - [HTTP Methods](#http-methods)
  - [HTTP Status Codes](#http-status-codes)
  - [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Authentication](#1-authentication)
  - [Account](#2-account)
  - [Manager Operations](#3-manager-operations)
  - [Staff Operations](#4-staff-operations)
  - [Public Endpoints](#5-public-endpoints)

---

## Overview

### HTTP Methods

| Method   | Usage                                              |
| -------- | -------------------------------------------------- |
| `GET`    | Used to retrieve resources                         |
| `POST`   | Used to create new resources or perform actions    |
| `PUT`    | Used to update existing resources                  |
| `PATCH`  | Used to partially update existing resources        |
| `DELETE` | Used to delete existing resources                  |

### HTTP Status Codes

| Status Code               | Usage                                           |
| ------------------------- | ----------------------------------------------- |
| `200 OK`                  | Request processed successfully                  |
| `201 Created`             | New resource created successfully               |
| `204 No Content`          | Update successful, no content to return         |
| `400 Bad Request`         | Invalid request (e.g., validation error)        |
| `401 Unauthorized`        | Authentication required or failed               |
| `403 Forbidden`           | Authentication successful but unauthorized      |
| `404 Not Found`           | Requested resource not found                    |
| `500 Internal Server Error` | Server error                                  |

### Authentication

EasyOrder API uses JWT (JSON Web Token) based authentication. After login or signup, you need to send the returned token in the `Authorization` header as `Bearer {token}` format in subsequent requests. The token is also returned as an HTTP-only cookie.

---

## API Endpoints

### 1. Authentication

Manages registration, login, and logout operations.

#### 1.1 Manager Signup

Creates a new manager account and restaurant.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**

```json
{
  "username": "testmanager",
  "email": "testmanager@example.com",
  "password": "TestPass123!",
  "restaurantName": "Test Restaurant",
  "restaurantLocation": "Istanbul, Besiktas"
}
```

**Request Fields:**

| Field              | Type     | Description          |
| ------------------ | -------- | -------------------- |
| `username`         | `String` | Username             |
| `email`            | `String` | Email address        |
| `password`         | `String` | Password             |
| `restaurantName`   | `String` | Restaurant name      |
| `restaurantLocation` | `String` | Restaurant location |

**Success Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "username": "testmanager",
  "role": "MANAGER",
  "hasRestaurant": true,
  "message": "Kayıt başarılı! Hoşgeldiniz."
}
```

**Response Fields:**

| Field          | Type      | Description        |
| -------------- | --------- | ------------------ |
| `token`        | `String`  | JWT Token          |
| `username`     | `String`  | Username           |
| `role`         | `String`  | Role               |
| `hasRestaurant`| `Boolean` | Restaurant status  |
| `message`      | `String`  | Message            |

**Error Response - Validation Error (400):**

```json
{
  "password": "Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir",
  "restaurantLocation": "Restoran konumu 5-200 karakter arasında olmalıdır",
  "restaurantName": "Restoran adı boş olamaz",
  "email": "Geçerli bir email adresi giriniz",
  "username": "Kullanıcı adı 3-20 karakter arasında olmalıdır"
}
```

---

#### 1.2 Login

Logs in an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "username": "logintest",
  "password": "TestPass123!"
}
```

**Request Fields:**

| Field      | Type     | Description |
| ---------- | -------- | ----------- |
| `username` | `String` | Username    |
| `password` | `String` | Password    |

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "username": "logintest",
  "role": "MANAGER",
  "hasRestaurant": true,
  "message": "Giriş başarılı! Hoşgeldiniz."
}
```

**Response Fields:**

| Field          | Type      | Description        |
| -------------- | --------- | ------------------ |
| `token`        | `String`  | JWT Token          |
| `username`     | `String`  | Username           |
| `role`         | `String`  | Role               |
| `hasRestaurant`| `Boolean` | Restaurant status  |
| `message`      | `String`  | Message            |

**Error Response - Invalid Login (401):**

```json
{
  "error": "Kullanıcı adı veya şifre hatalı"
}
```

---

#### 1.3 Logout

Logs out the user and clears the JWT cookie.

**Endpoint:** `POST /api/auth/logout`

**Success Response (200 OK):**

```
Çıkış başarılı
```

---

### 2. Account

Manages account operations for logged-in users.

#### 2.1 Get User Info (Manager)

Returns information of the logged-in Manager user.

**Endpoint:** `GET /api/account/me`

**Success Response (200 OK) - Manager:**

```json
{
  "id": 13,
  "username": "testmanager_account",
  "email": "testmanager_account@example.com",
  "role": "MANAGER",
  "hasRestaurant": true,
  "passwordChangeRequired": false
}
```

**Response Fields:**

| Field                   | Type      | Description                    |
| ----------------------- | --------- | ------------------------------ |
| `id`                    | `Number`  | User ID                        |
| `username`              | `String`  | Username                       |
| `email`                 | `String`  | Email                          |
| `role`                  | `String`  | Role                           |
| `hasRestaurant`         | `Boolean` | Has restaurant                 |
| `passwordChangeRequired`| `Boolean` | Password change required       |

---

#### 2.2 Get User Info (Staff)

Returns information of the logged-in Staff user.

**Endpoint:** `GET /api/account/me`

**Success Response (200 OK) - Staff:**

```json
{
  "id": 20,
  "username": "teststaff_account",
  "email": null,
  "role": "STAFF",
  "hasRestaurant": false,
  "passwordChangeRequired": true
}
```

**Response Fields:**

| Field                   | Type      | Description                    |
| ----------------------- | --------- | ------------------------------ |
| `id`                    | `Number`  | User ID                        |
| `username`              | `String`  | Username                       |
| `email`                 | `Null`    | Email                          |
| `role`                  | `String`  | Role                           |
| `hasRestaurant`         | `Boolean` | Has restaurant                 |
| `passwordChangeRequired`| `Boolean` | Password change required       |

---

#### 2.3 Change Password

Allows the logged-in user to change their password.

**Endpoint:** `POST /api/account/change-password`

**Request Body:**

```json
{
  "currentPassword": "TestPass123!",
  "newPassword": "YeniSifre123!"
}
```

**Request Fields:**

| Field            | Type     | Description      |
| ---------------- | -------- | ---------------- |
| `currentPassword`| `String` | Current password |
| `newPassword`    | `String` | New password     |

**Success Response (200 OK):**

```
Şifre başarıyla güncellendi.
```

**Error Response - Wrong Current Password (400):**

```json
{
  "error": "Mevcut şifreniz hatalı. Lütfen kontrol ediniz."
}
```

**Error Response - New Password Same as Old (400):**

```json
{
  "error": "Yeni şifre, mevcut şifrenizle aynı olamaz. Lütfen farklı bir şifre seçiniz."
}
```

---

### 3. Manager Operations

Endpoints for Manager role users to manage their restaurant.

#### 3.1 Create Staff

Creates a new staff member.

**Endpoint:** `POST /api/manager/staff`

**Request Body:**

```json
{
  "username": "newstaff_user",
  "password": "StaffPass123!"
}
```

**Request Fields:**

| Field      | Type     | Description        |
| ---------- | -------- | ------------------ |
| `username` | `String` | Username           |
| `password` | `String` | Temporary password |

**Success Response (201 Created):**

```json
{
  "message": "Personel (Staff) başarıyla oluşturuldu: newstaff_user"
}
```

**Error Response - Username Conflict (400):**

```json
{
  "error": "Bu kullanıcı adı zaten mevcut."
}
```

---

#### 3.2 Create Category

Creates a new menu category.

**Endpoint:** `POST /api/manager/menu/categories`

**Request Body:**

```json
{
  "name": "İçecekler"
}
```

**Request Fields:**

| Field  | Type     | Description   |
| ------ | -------- | ------------- |
| `name` | `String` | Category name |

**Success Response (201 Created):**

```json
{
  "id": 10,
  "name": "İçecekler",
  "menuItems": [],
  "restaurantId": "52c86e78-602f-443f-a7d5-24f218879650"
}
```

**Response Fields:**

| Field         | Type     | Description   |
| ------------- | -------- | ------------- |
| `id`          | `Number` | Category ID   |
| `name`        | `String` | Category name |
| `menuItems`   | `Array`  | Menu items    |
| `restaurantId`| `String` | Restaurant ID |

---

#### 3.3 Add Menu Item

Adds a new item to a category.

**Endpoint:** `POST /api/manager/menu/categories/{categoryId}/items`

**Path Parameters:**

| Parameter    | Description |
| ------------ | ----------- |
| `categoryId` | Category ID |

**Request Body:**

```json
{
  "name": "Mercimek",
  "description": "Sıcak",
  "price": 25.5,
  "imageUrl": "http://url",
  "style": "NONE",
  "categoryId": 7
}
```

**Request Fields:**

| Field        | Type     | Description  |
| ------------ | -------- | ------------ |
| `name`       | `String` | Name         |
| `description`| `String` | Description  |
| `price`      | `Number` | Price        |
| `imageUrl`   | `String` | Image URL    |
| `style`      | `String` | Style        |
| `categoryId` | `Number` | Category ID  |

**Success Response (201 Created):**

```json
{
  "id": 4,
  "name": "Mercimek",
  "description": "Sıcak",
  "price": 25.5,
  "imageUrl": "http://url",
  "style": "NONE",
  "categoryId": 7,
  "categoryName": "Başlangıçlar"
}
```

**Response Fields:**

| Field         | Type     | Description   |
| ------------- | -------- | ------------- |
| `id`          | `Number` | ID            |
| `name`        | `String` | Name          |
| `description` | `String` | Description   |
| `price`       | `Number` | Price         |
| `imageUrl`    | `String` | Image URL     |
| `style`       | `String` | Style         |
| `categoryId`  | `Number` | Category ID   |
| `categoryName`| `String` | Category name |

---

#### 3.4 Create Table

Creates a new table.

**Endpoint:** `POST /api/manager/tables`

**Request Body:**

```json
{
  "tableNumber": "Masa 10"
}
```

**Request Fields:**

| Field        | Type     | Description  |
| ------------ | -------- | ------------ |
| `tableNumber`| `String` | Table number |

**Success Response (201 Created):**

```json
{
  "id": 2,
  "tableNumber": "Masa 10",
  "restaurantId": "f47024e4-effb-47b7-ad5a-38d594296055"
}
```

**Response Fields:**

| Field         | Type     | Description   |
| ------------- | -------- | ------------- |
| `id`          | `Number` | ID            |
| `tableNumber` | `String` | Table number  |
| `restaurantId`| `String` | Restaurant ID |

**Error Response - Table Number Conflict (400):**

```json
{
  "error": "Aynı numaraya sahip masa zaten mevcut."
}
```

---

#### 3.5 List Tables

Returns all tables for the restaurant.

**Endpoint:** `GET /api/manager/tables`

**Success Response (200 OK):**

```json
[
  {
    "id": 3,
    "tableNumber": "Bahçe 1",
    "restaurantId": "a98a5221-c52a-4b85-969c-333ae72fddd3"
  },
  {
    "id": 4,
    "tableNumber": "Salon 5",
    "restaurantId": "a98a5221-c52a-4b85-969c-333ae72fddd3"
  }
]
```

**Response Fields:**

| Field              | Type     | Description   |
| ------------------ | -------- | ------------- |
| `[]`               | `Array`  | Table list    |
| `[].id`            | `Number` | ID            |
| `[].tableNumber`   | `String` | Table number  |
| `[].restaurantId`  | `String` | Restaurant ID |

---

### 4. Staff Operations

Endpoints for Staff role users.

#### 4.1 Hello Endpoint (Test)

A test endpoint for staff.

**Endpoint:** `GET /api/staff/hello`

**Success Response (200 OK):**

```
Merhaba Staff, Manager ve Süper Admin!
```

---

### 5. Public Endpoints

Endpoints that do not require authentication.

#### 5.1 Get Restaurant Menu

Returns the menu for a specific restaurant.

**Endpoint:** `GET /api/public/restaurants/{restaurantId}/menu`

**Path Parameters:**

| Parameter      | Description            |
| -------------- | ---------------------- |
| `restaurantId` | Restaurant ID (UUID)   |

**Success Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Çorbalar",
    "menuItems": [
      {
        "id": 1,
        "name": "Mercimek",
        "description": null,
        "price": 30.0,
        "imageUrl": null,
        "style": null,
        "categoryId": 1,
        "categoryName": "Çorbalar"
      }
    ],
    "restaurantId": "031db5ec-5d0f-42c7-a24d-c415fd987f2f"
  }
]
```

**Response Fields:**

| Field                        | Type     | Description    |
| ---------------------------- | -------- | -------------- |
| `[]`                         | `Array`  | Category list  |
| `[].id`                      | `Number` | Category ID    |
| `[].name`                    | `String` | Category name  |
| `[].restaurantId`            | `String` | Restaurant ID  |
| `[].menuItems`               | `Array`  | Menu items     |
| `[].menuItems[].id`          | `Number` | Item ID        |
| `[].menuItems[].name`        | `String` | Item name      |
| `[].menuItems[].description` | `String` | Description    |
| `[].menuItems[].price`       | `Number` | Price          |
| `[].menuItems[].imageUrl`    | `String` | Image URL      |
| `[].menuItems[].style`       | `String` | Style          |
| `[].menuItems[].categoryId`  | `Number` | Category ID    |
| `[].menuItems[].categoryName`| `String` | Category name  |

**Error Response - Restaurant Not Found (400):**

```json
{
  "error": "Restoran bulunamadı"
}
```

**Error Response - Invalid ID Format (400):**

```json
{
  "error": "Geçersiz parametre formatı: restaurantId"
}
```

---

## Notes

- All authenticated endpoints require the JWT token to be sent either as a `Bearer` token in the `Authorization` header or as an HTTP-only cookie named `JWT_TOKEN`.
- Passwords must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
- Username must be between 3-20 characters.
- Restaurant location must be between 5-200 characters.

---

*Last updated: November 2025*
