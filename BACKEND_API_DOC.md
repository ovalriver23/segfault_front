
````markdown
## 4. Kimlik Doğrulama (Authentication)

### 4.1. Manager Kayıt

Yeni bir manager hesabı ve restoran oluşturur.

#### 4.1.1. Örnek İstek

```http
POST /api/auth/signup HTTP/1.1
Content-Type: application/json;charset=UTF-8
Content-Length: 189
Host: localhost:8080

{
  "username" : "testmanager",
  "email" : "testmanager@example.com",
  "password" : "TestPass123!",
  "restaurantName" : "Test Restaurant",
  "restaurantLocation" : "Istanbul, Besiktas"
}
````

#### 4.1.2. Örnek Yanıt

```http
HTTP/1.1 201 Created
Set-Cookie: JWT_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0bWFuYWdlciIsImlhdCI6MTc2MTgzMDUwNywiZXhwIjoxNzYxOTE2OTA3fQ.L1jqdnj7_hjfjEs7IzB4RiB-xRm2LOWrfSDjiiCdILQ; Path=/; Max-Age=86400; Expires=Fri, 31 Oct 2025 13:21:47 GMT; HttpOnly
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 286

{
  "token" : "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0bWFuYWdlciIsImlhdCI6MTc2MTgzMDUwNywiZXhwIjoxNzYxOTE2OTA3fQ.L1jqdnj7_hjfjEs7IzB4RiB-xRm2LOWrfSDjiiCdILQ",
  "username" : "testmanager",
  "role" : "MANAGER",
  "hasRestaurant" : true,
  "message" : "Kayıt başarılı! Hoşgeldiniz."
}
```

#### 4.1.3. İstek Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `username` | `String` | Kullanıcı adı (benzersiz olmalı) |
| `email` | `String` | E-posta adresi (geçerli format ve benzersiz olmalı) |
| `password` | `String` | Şifre (minimum 8 karakter) |
| `restaurantName` | `String` | Restoran adı |
| `restaurantLocation` | `String` | Restoran konumu |

#### 4.1.4. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `token` | `String` | JWT authentication token |
| `username` | `String` | Kullanıcı adı |
| `role` | `String` | Kullanıcı rolü (MANAGER, STAFF, SUPER\_ADMIN) |
| `hasRestaurant` | `Boolean` | Kullanıcının restoranı olup olmadığı |
| `message` | `String` | İşlem sonucu mesajı |

#### 4.1.5. Yanıt Cookies

| Name | Description |
| :--- | :--- |
| `JWT_TOKEN` | HTTP-only JWT cookie |

-----

### 4.2. Login

Mevcut kullanıcı girişi yapar.

#### 4.2.1. Örnek İstek

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json;charset=UTF-8
Content-Length: 61
Host: localhost:8080

{
  "username" : "logintest",
  "password" : "TestPass123!"
}
```

#### 4.2.2. Örnek Yanıt

```http
HTTP/1.1 200 OK
Set-Cookie: JWT_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsb2dpbnRlc3QiLCJpYXQiOjE3NjE4MzA1MDcsImV4cCI6MTc2MTkxNjkwN30.YYcv4RbfooVtUhBuCEhXgVs4EIxyjKNjSEMVXm80WA0; Path=/; Max-Age=86400; Expires=Fri, 31 Oct 2025 13:21:47 GMT; HttpOnly
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 281

{
  "token" : "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsb2dpbnRlc3QiLCJpYXQiOjE3NjE4MzA1MDcsImV4cCI6MTc2MTkxNjkwN30.YYcv4RbfooVtUhBuCEhXgVs4EIxyjKNjSEMVXm80WA0",
  "username" : "logintest",
  "role" : "MANAGER",
  "hasRestaurant" : true,
  "message" : "Giriş başarılı! Hoşgeldiniz."
}
```

#### 4.2.3. İstek Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `username` | `String` | Kullanıcı adı |
| `password` | `String` | Şifre |

#### 4.2.4. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `token` | `String` | JWT authentication token |
| `username` | `String` | Kullanıcı adı |
| `role` | `String` | Kullanıcı rolü (MANAGER, STAFF, SUPER\_ADMIN) |
| `hasRestaurant` | `Boolean` | Kullanıcının restoranı olup olmadığı |
| `message` | `String` | İşlem sonucu mesajı |

#### 4.2.5. Yanıt Cookies

| Name | Description |
| :--- | :--- |
| `JWT_TOKEN` | HTTP-only JWT cookie |

-----

### 4.3. Logout

Kullanıcı çıkışı yapar ve JWT cookie’yi temizler.

#### 4.3.1. Örnek İstek

```http
POST /api/auth/logout HTTP/1.1
Content-Type: application/json;charset=UTF-8
Host: localhost:8080
```

#### 4.3.2. Örnek Yanıt

```http
HTTP/1.1 200 OK
Set-Cookie: JWT_TOKEN=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly
Content-Type: text/plain;charset=UTF-8
Content-Length: 21
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY

Çıkış başarılı
```

```
