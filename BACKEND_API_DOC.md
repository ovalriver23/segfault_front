# EasyOrder REST API Dokümantasyonu

## Genel Bakış

EasyOrder, restoran yönetim sistemi için geliştirilmiş bir REST API'dir.

### 1. HTTP Metodları

EasyOrder REST API'si aşağıdaki HTTP metodlarını kullanır:

| Metod | Kullanım |
| :--- | :--- |
| `GET` | Kaynak getirmek için kullanılır |
| `POST` | Yeni kaynak oluşturmak veya eylem gerçekleştirmek için kullanılır |
| `PUT` | Mevcut kaynağı güncellemek için kullanılır |
| `PATCH` | Mevcut kaynağı kısmen güncellemek için kullanılır |
| `DELETE` | Mevcut kaynağı silmek için kullanılır |

### 2. HTTP Durum Kodları

EasyOrder REST API'si aşağıdaki HTTP durum kodlarını kullanır:

| Durum Kodu | Kullanım |
| :--- | :--- |
| `200 OK` | İstek başarılı bir şekilde işlendi |
| `201 Created` | Yeni kaynak başarıyla oluşturuldu |
| `204 No Content` | Güncellenme işlemi başarılı, ancak döndürülecek içerik yok |
| `400 Bad Request` | İstek hatalı (örn: validation hatası) |
| `401 Unauthorized` | Kimlik doğrulama gerekli veya başarısız |
| `403 Forbidden` | Kimlik doğrulama başarılı ancak yetkisiz |
| `404 Not Found` | İstenen kaynak bulunamadı |
| `500 Internal Server Error` | Sunucu hatası |

### 3. Kimlik Doğrulama

EasyOrder API, JWT (JSON Web Token) tabanlı kimlik doğrulama kullanır. Login veya signup işlemi sonrasında dönen token'ı, sonraki isteklerde `Authorization` header'ında `Bearer {token}` formatında göndermeniz gerekir. Ayrıca token HTTP-only cookie olarak da döndürülür.

-----

## 4. Kimlik Doğrulama (Authentication)

Kayıt, giriş ve çıkış işlemlerini yönetir.

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
```

#### 4.1.2. Örnek Yanıt

```http
HTTP/1.1 201 Created
Set-Cookie: JWT_TOKEN=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0bWFuYWdlciIsImlhdCI6MTc2MjkzMzg4OCwiZXhwIjoxNzYzMDIwMjg4fQ.bY-OvFWrkVt3dTy6NtG3x_kfNUnRjlOedRj61V9KxIDu2S-X9b5uEUE3iG69ZCNgnZ0uLfzlAzSNLrezP1EoOw; Path=/; Max-Age=86400; Expires=Thu, 13 Nov 2025 07:51:28 GMT; HttpOnly
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 329

{
  "token" : "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0bWFuYWdlciIsImlhdCI6MTc2MjkzMzg4OCwiZXhwIjoxNzYzMDIwMjg4fQ.bY-OvFWrkVt3dTy6NtG3x_kfNUnRjlOedRj61V9KxIDu2S-X9b5uEUE3iG69ZCNgnZ0uLfzlAzSNLrezP1EoOw",
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
```http
HTTP/1.1 200 OK
Set-Cookie: JWT_TOKEN=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsb2dpbnRlc3QiLCJpYXQiOjE3NjI5MzM4ODgsImV4cCI6MTc2MzAyMDI4OH0.Yfvo6escsyHALXf8R9khOGeVYz2F7xc4vQAQp08giY9uRsA7ZnmmrCxnS7P7t33fLY27sqBRHPoiL2TbrRzs9A; Path=/; Max-Age=86400; Expires=Thu, 13 Nov 2025 07:51:28 GMT; HttpOnly
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 324

{
  "token" : "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsb2dpbnRlc3QiLCJpYXQiOjE3NjI5MzM4ODgsImV4cCI6MTc2MzAyMDI4OH0.Yfvo6escsyHALXf8R9khOGeVYz2F7xc4vQAQp08giY9uRsA7ZnmmrCxnS7P7t33fLY27sqBRHPoiL2TbrRzs9A",
  "username" : "logintest",
  "role" : "MANAGER",
  "hasRestaurant" : true,
  "message" : "Giriş başarılı! Hoşgeldiniz."
}
```
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

-----

## 5. Hesap (Account)

Giriş yapmış kullanıcının hesap işlemlerini yönetir.

### 5.1. Kullanıcı Bilgilerini Getir (Manager)

Oturum açmış Manager rolündeki kullanıcının bilgilerini döndürür.

**Endpoint:** `GET /api/account/me`

#### 5.1.1. Örnek Yanıt (Manager)

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 184

{
  "id" : 10,
  "username" : "testmanager_account",
  "email" : "testmanager_account@example.com",
  "role" : "MANAGER",
  "hasRestaurant" : true,
  "passwordChangeRequired" : false
}
```

#### 5.1.2. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `id` | `Number` | Kullanıcı ID |
| `username` | `String` | Kullanıcı adı |
| `email` | `String` | E-posta adresi (varsa) |
| `role` | `String` | Kullanıcı rolü (MANAGER) |
| `hasRestaurant` | `Boolean` | Kullanıcının bir restoranı olup olmadığı (MANAGER için true) |
| `passwordChangeRequired` | `Boolean` | Kullanıcının şifresini değiştirmesi gerekip gerekmediği |

-----

### 5.2. Kullanıcı Bilgilerini Getir (Staff)

Oturum açmış Staff rolündeki kullanıcının bilgilerini döndürür.

**Endpoint:** `GET /api/account/me`

#### 5.2.1. Örnek Yanıt (Staff)

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 151

{
  "id" : 15,
  "username" : "teststaff_account",
  "email" : null,
  "role" : "STAFF",
  "hasRestaurant" : false,
  "passwordChangeRequired" : true
}
```

#### 5.2.2. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `id` | `Number` | Kullanıcı ID |
| `username` | `String` | Kullanıcı adı |
| `email` | `Null` | E-posta adresi (varsa, staff için null olabilir) |
| `role` | `String` | Kullanıcı rolü (STAFF) |
| `hasRestaurant` | `Boolean` | Kullanıcının bir restoranı olup olmadığı (STAFF için false) |
| `passwordChangeRequired` | `Boolean` | Kullanıcının şifresini değiştirmesi gerekip gerekmediği (STAFF için true) |

-----

### 5.3. Şifre Değiştir

Oturum açmış kullanıcının şifresini değiştirmesini sağlar.

**Endpoint:** `POST /api/account/change-password`

#### 5.3.1. Örnek İstek

```http
POST /api/account/change-password HTTP/1.1
Content-Type: application/json;charset=UTF-8
Content-Length: 37
Host: localhost:8080

{
  "newPassword" : "YeniSifre123!"
}
```

#### 5.3.2. İstek Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `newPassword` | `String` | Yeni şifre (validation kurallarına uymalı) |

#### 5.3.3. Örnek Yanıt

```http
HTTP/1.1 200 OK
Content-Type: text/plain;charset=UTF-8
Content-Length: 32
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY

Şifre başarıyla güncellendi.
```

-----

## 6. Manager İşlemleri

Manager rolündeki kullanıcının restoranını yönetmesi için olan endpoint'ler.

### 6.1. Personel (Staff) Oluştur

**Endpoint:** `POST /api/manager/staff`

#### 6.1.1. Örnek İstek

```http
POST /api/manager/staff HTTP/1.1
Content-Type: application/json;charset=UTF-8
Content-Length: 66
Host: localhost:8080

{
  "username" : "newstaff_user",
  "password" : "StaffPass123!"
}
```

#### 6.1.2. İstek Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `username` | `String` | Oluşturulacak personelin kullanıcı adı (benzersiz olmalı) |
| `password` | `String` | Personelin geçici şifresi (validation kurallarına uymalı) |

#### 6.1.3. Örnek Yanıt

```http
HTTP/1.1 201 Created
Content-Type: text/plain;charset=UTF-8
Content-Length: 56
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY

Personel (Staff) başarıyla oluşturuldu: newstaff_user
```

-----

### 6.2. Kategori Oluştur

**Endpoint:** `POST /api/manager/menu/categories`

#### 6.2.1. Örnek İstek

```http
POST /api/manager/menu/categories HTTP/1.1
Content-Type: application/json;charset=UTF-8
Content-Length: 28
Host: localhost:8080

{
  "name" : "İçecekler"
}
```

#### 6.2.2. İstek Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `name` | `String` | Yeni kategorinin adı |

#### 6.2.3. Örnek Yanıt

```http
HTTP/1.1 201 Created
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 83

{
  "id" : 7,
  "name" : "İçecekler",
  "menuItems" : [ ],
  "restaurantId" : 8
}
```

#### 6.2.4. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `id` | `Number` | Oluşturulan kategorinin ID'si |
| `name` | `String` | Kategorinin adı |
| `menuItems` | `Array` | Kategorideki menü öğeleri (yeni kategori için boş) |
| `restaurantId` | `Number` | Restoran ID'si |

-----

### 6.3. Menü Öğesi Ekle

**Endpoint:** `POST /api/manager/menu/categories/{categoryId}/items`

#### 6.3.1. Path Parametreleri

| Parameter | Description |
| :--- | :--- |
| `categoryId` | Menü öğesinin ekleneceği kategori ID'si |

#### 6.3.2. Örnek İstek

```http
POST /api/manager/menu/categories/4/items HTTP/1.1
Content-Type: application/json;charset=UTF-8
Content-Length: 176
Host: localhost:8080

{
  "name" : "Mercimek Çorbası",
  "description" : "Sıcak ve taze",
  "price" : 25.5,
  "imageUrl" : "http://example.com/corba.jpg",
  "style" : "NONE",
  "categoryId" : 4
}
```

#### 6.3.3. İstek Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `name` | `String` | Menü öğesinin adı |
| `description` | `String` | Açıklama |
| `price` | `Number` | Fiyat |
| `imageUrl` | `String` | Görsel URL'si |
| `style` | `String` | Öğe stili (Şu an sadece 'NONE' destekleniyor) |
| `categoryId` | `Number` | Kategori ID'si |

#### 6.3.4. Örnek Yanıt

```http
HTTP/1.1 201 Created
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 226

{
  "id" : 2,
  "name" : "Mercimek Çorbası",
  "description" : "Sıcak ve taze",
  "price" : 25.5,
  "imageUrl" : "http://example.com/corba.jpg",
  "style" : "NONE",
  "categoryId" : 4,
  "categoryName" : "Başlangıçlar"
}
```

#### 6.3.5. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `id` | `Number` | Oluşturulan menü öğesinin ID'si |
| `name` | `String` | Öğe adı |
| `description` | `String` | Açıklama |
| `price` | `Number` | Fiyat |
| `imageUrl` | `String` | Görsel URL'si |
| `style` | `String` | Öğe stili |
| `categoryId` | `Number` | Kategori ID'si |
| `categoryName` | `String` | Kategori adı |

-----

### 6.4. Masa Oluştur

**Endpoint:** `POST /api/manager/tables`

#### 6.4.1. Örnek İstek

```http
POST /api/manager/tables HTTP/1.1
Content-Type: application/json;charset=UTF-8
Content-Length: 40
Host: localhost:8080

{
  "tableNumber" : "Masa 10 (Bahçe)"
}
```

#### 6.4.2. İstek Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `tableNumber` | `String` | Masa numarası veya adı (Restoran içinde benzersiz olmalı) |

#### 6.4.3. Örnek Yanıt

```http
HTTP/1.1 201 Created
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 74

{
  "id" : 3,
  "tableNumber" : "Masa 10 (Bahçe)",
  "restaurantId" : 5
}
```

#### 6.4.4. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `id` | `Number` | Oluşturulan masanın ID'si |
| `tableNumber` | `String` | Masa numarası |
| `restaurantId` | `Number` | Restoran ID'si |

-----

### 6.5. Masaları Listele

**Endpoint:** `GET /api/manager/tables`

#### 6.5.1. Örnek Yanıt

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 68

[ {
  "id" : 5,
  "tableNumber" : "Masa 1",
  "restaurantId" : 7
} ]
```

#### 6.5.2. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `[]` | `Array` | Restorana ait masaların listesi |
| `[].id` | `Number` | Masa ID'si |
| `[].tableNumber` | `String` | Masa numarası |
| `[].restaurantId` | `Number` | Restoran ID'si |

-----

## 7. Staff İşlemleri

### 7.1. Merhaba Endpoint'i (Test)

**Endpoint:** `GET /api/staff/hello`

#### 7.1.1. Örnek İstek

```http
GET /api/staff/hello HTTP/1.1
Host: localhost:8080
```

#### 7.1.2. Örnek Yanıt

```http
HTTP/1.1 200 OK
Content-Type: text/plain;charset=UTF-8
Content-Length: 39
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY

Merhaba Staff, Manager ve Süper Admin!
```

-----

## 8. Halka Açık (Public) Endpoint'ler

Kimlik doğrulama gerektirmeyen endpoint'ler.

### 8.1. Restoran Menüsünü Getir

**Endpoint:** `GET /api/public/restaurants/{restaurantId}/menu`

#### 8.1.1. Path Parametreleri

| Parameter | Description |
| :--- | :--- |
| `restaurantId` | Menüsü alınacak restoranın ID'si |

#### 8.1.2. Örnek İstek

```http
GET /api/public/restaurants/1/menu HTTP/1.1
Content-Type: application/json;charset=UTF-8
Host: localhost:8080
```

#### 8.1.3. Örnek Yanıt

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 274

[ {
  "id" : 1,
  "name" : "Çorbalar",
  "menuItems" : [ {
    "id" : 1,
    "name" : "Mercimek",
    "description" : null,
    "price" : 30.0,
    "imageUrl" : null,
    "style" : null,
    "categoryId" : 1,
    "categoryName" : "Çorbalar"
  } ],
  "restaurantId" : 1
} ]
```

#### 8.1.4. Yanıt Alanları

| Path | Type | Description |
| :--- | :--- | :--- |
| `[]` | `Array` | Restoranın menü kategorileri listesi |
| `[].id` | `Number` | Kategori ID'si |
| `[].name` | `String` | Kategori adı |
| `[].restaurantId` | `Number` | Restoran ID'si |
| `[].menuItems` | `Array` | Kategoriye ait menü öğeleri (Boş olabilir) |
| `[].menuItems[].id` | `Number` | Menü öğesi ID'si |
| `[].menuItems[].name` | `String` | Öğe adı |
| `[].menuItems[].description` | `String` | Açıklama (null olabilir) |
| `[].menuItems[].price` | `Number` | Fiyat |
| `[].menuItems[].imageUrl` | `String` | Görsel URL'si (null olabilir) |
| `[].menuItems[].style` | `String` | Öğe stili (null olabilir) |
| `[].menuItems[].categoryId` | `Number` | Kategori ID'si |
| `[].menuItems[].categoryName` | `String` | Kategori adı |
```
