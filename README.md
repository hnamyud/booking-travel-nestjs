# 🚀 Booking Travel NestJS API

> Hệ thống API backend hiện đại cho ứng dụng đặt tour du lịch, được xây dựng bằng NestJS v11.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Kiến trúc](#-kiến-trúc)
- [API Endpoints](#-api-endpoints)
- [Bảo mật](#-bảo-mật)
- [License](#-license)

## ✨ Tính năng

### Core Features
- **Quản lý người dùng**: Đăng ký, đăng nhập, phân quyền với CASL
- **Quản lý tour**: CRUD tour với soft delete, lọc theo điểm đến, giá, ngày
- **Hệ thống đặt chỗ**: Đặt tour với xử lý concurrency, tránh double-booking
- **Thanh toán VNPay**: Tích hợp cổng thanh toán VNPay với IPN callback
- **Email Service**: Gửi email xác nhận booking với QR code ticket
- **Quản lý điểm đến**: Thông tin chi tiết về các địa điểm du lịch
- **Đánh giá & Review**: Người dùng có thể đánh giá tour đã tham gia

### Advanced Features
- **Concurrency Control**: Redis distributed locks để tránh race condition khi đặt tour
- **Auto Expiry Bookings**: Scheduler tự động hủy booking sau 15 phút nếu chưa thanh toán
- **Soft Delete**: Dữ liệu không bị xóa vĩnh viễn, có thể khôi phục (aggregation cần filter manual)
- **File Upload**: Upload ảnh lên Cloudinary với validation
- **Rate Limiting**: Bảo vệ API khỏi spam và DDoS (3-tier protection)
- **Security Headers**: Helmet configuration với CSP, HSTS
- **Request Logging**: Middleware ghi log mọi request với unique ID
- **Email with QR Code**: Tự động gửi ticket với mã QR sau khi thanh toán thành công
- **OTP Reset Password**: Hệ thống reset mật khẩu qua email với OTP (5 phút expire)

## 🛠 Công nghệ sử dụng

### Framework & Runtime
- **NestJS v11.1.9**: Progressive Node.js framework
- **Node.js**: JavaScript runtime (v18 hoặc cao hơn khuyến nghị)
- **TypeScript**: Typed superset của JavaScript

### Database & Caching
- **MongoDB v8.9.1**: NoSQL database với Mongoose ODM
- **Redis**: In-memory cache cho distributed locking
- **soft-delete-plugin-mongoose v2.0.0**: Soft delete pattern

### Authentication & Authorization
- **@nestjs/jwt v10.2.0**: JWT token generation/verification
- **@nestjs/passport v10.0.3**: Passport integration
- **passport-local & passport-jwt**: Authentication strategies
- **@casl/ability v6.7.3**: Role-based access control (RBAC)

### Security
- **helmet v8.0.0**: Security headers (CSP, HSTS, X-Frame-Options)
- **@nestjs/throttler v6.5.0**: Rate limiting (3-tier protection)
- **bcryptjs**: Password hashing

### Payment & External Services
- **vnpay**: VNPay payment gateway SDK
- **Cloudinary**: Image storage và CDN
- **ioredis**: Redis client cho Node.js
- **@nestjs-modules/mailer**: Email service với Handlebars templates
- **qrcode**: QR code generation cho booking tickets

### Background Jobs
- **@nestjs/schedule v4.1.1**: Cron jobs và task scheduling

### Validation & Configuration
- **class-validator & class-transformer**: DTO validation
- **@nestjs/config v3.2.0**: Environment configuration
- **joi v17.13.3**: Environment schema validation

### Documentation
- **@nestjs/swagger v7.0.0**: OpenAPI/Swagger documentation

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd booking-travel-nestjs

# Cài đặt dependencies
npm install --legacy-peer-deps

# Hoặc dùng yarn
yarn install
```

## ⚙️ Cấu hình

Tạo file `.env` trong thư mục root với các biến sau:

```bash
# Application
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/booking-travel

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# VNPay Payment Gateway
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
VNPAY_HOST=https://sandbox.vnpayment.vn
VNPAY_RETURN_URL=http://localhost:3000/api/payment/vnpay-return

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

### Cấu hình MongoDB

```bash
# Start MongoDB (nếu chạy local)
mongod --dbpath /path/to/data/db

# Hoặc dùng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI với connection string từ Atlas
```

### Cấu hình Redis

```bash
# Start Redis (nếu chạy local)
redis-server

# Hoặc dùng Redis Cloud
# Cập nhật REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
```

## 🚀 Chạy ứng dụng

```bash
# Development mode với hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

API Documentation (Swagger): `http://localhost:3000/docs`

## 🏗 Kiến trúc

### Cấu trúc thư mục

```
src/
├── modules/                    # Feature modules
│   ├── auth/                   # Authentication & JWT
│   ├── user/                   # User management
│   ├── tour/                   # Tour management
│   ├── booking/                # Booking với concurrency
│   │   ├── bookings.service.ts
│   │   ├── booking.scheduler.ts
│   │   └── schemas/
│   ├── payment/                # Payment processing
│   ├── destination/            # Destination management
│   ├── review/                 # Review system
│   └── vnpay/                  # VNPay integration
├── shared/
│   ├── cache/
│   │   └── redis.module.ts     # Redis connection
│   ├── cloudinary/             # File upload service
│   ├── mailer/                 # Email service
│   │   ├── mail.service.ts
│   │   └── templates/          # Handlebars email templates
│   │       ├── reset-password.hbs
│   │       └── confirm-booking.hbs
│   └── qrcode/                 # QR code generation
├── common/
│   ├── services/
│   │   └── lock.service.ts     # Distributed locking
│   └── interfaces/             # Shared interfaces
├── config/
│   └── helmet.config.ts        # Security headers
├── core/
│   ├── abilities/              # CASL authorization
│   ├── middleware/
│   │   └── logger.middleware.ts
│   └── transform.interceptor.ts
├── decorator/
│   └── customize.decorator.ts  # Custom decorators
├── app.module.ts               # Root module
└── main.ts                     # Application entry
```

### Design Patterns

1. **Module Pattern**: Mỗi feature là một NestJS module độc lập
2. **Repository Pattern**: Sử dụng Mongoose models như repositories
3. **Strategy Pattern**: Passport strategies cho authentication
4. **Factory Pattern**: Dynamic module registration (VnpayModule.registerAsync)
5. **Decorator Pattern**: Custom decorators cho authentication, authorization
6. **Middleware Pattern**: Request logging, error handling

### Data Flow

```
Request → Middleware (Logger, Auth) 
       → Guard (JWT, Throttler) 
       → Controller 
       → Service (Business Logic) 
       → Repository (Database) 
       → Response
```

### Booking Flow với Concurrency Control

```
User Request → BookingController.create()
            → BookingsService.create()
            → LockService.withLock(tour_id)
            → MongoDB Transaction (session)
            → Check availableSlots
            → Create Booking (status=Pending)
            → Decrement availableSlots
            → Commit Transaction
            → Release Lock
            → Return Booking
```

### Payment Flow

```
User completes booking → PaymentsService.create()
                      → VnpayService.buildPaymentUrl()
                      → Redirect to VNPay
                      → User pays
                      → VNPay IPN callback
                      → PaymentsService.handleVnpayIpn()
                      → Verify signature
                      → Update payment status
                      → BookingsService.confirmBooking()
                      → Update booking status
                      → MailService.sendConfirmationEmail()
                      → Generate QR code ticket
                      → Send email with ticket
```

### Email Flow

```
Reset Password:
User request reset → MailService.sendResetPasswordEmail()
                  → Generate 6-digit OTP
                  → Store in Redis (5 min expire)
                  → Send email with OTP
                  → User submits OTP
                  → Validate and reset password

Booking Confirmation:
Payment success → BookingsService.confirmBooking()
               → MailService.sendConfirmationEmail()
               → QRCodeService.generateQrCodeAsBuffer(ticketCode)
               → Render Handlebars template
               → Attach QR code image
               → Send email to customer
```

### Scheduler Flow

```
Cron job (every minute) → BookingScheduler.expireOldBookings()
                        → Find bookings (status=Pending, createdAt < 15 min)
                        → MongoDB Transaction
                        → Update booking status to Expired
                        → Restore tour availableSlots
                        → Commit Transaction
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      - Đăng ký tài khoản mới
POST   /api/auth/login         - Đăng nhập
GET    /api/auth/profile       - Lấy thông tin user (JWT required)
```

### Users
```
GET    /api/users              - Lấy danh sách users (Admin only)
GET    /api/users/:id          - Lấy thông tin user
PATCH  /api/users/:id          - Cập nhật user
DELETE /api/users/:id          - Xóa user (Soft delete)
```

### Tours
```
GET    /api/tours              - Lấy danh sách tours (filter, sort, pagination)
GET    /api/tours/:id          - Lấy chi tiết tour
POST   /api/tours              - Tạo tour mới (Admin only)
PATCH  /api/tours/:id          - Cập nhật tour (Admin only)
DELETE /api/tours/:id          - Xóa tour (Admin only, Soft delete)
```

### Bookings
```
GET    /api/bookings           - Lấy danh sách bookings
GET    /api/bookings/:id       - Lấy chi tiết booking
POST   /api/bookings           - Tạo booking mới (với Redis lock)
PATCH  /api/bookings/:id       - Cập nhật booking
DELETE /api/bookings/:id       - Hủy booking
POST   /api/bookings/:id/verify - Verify ticket bằng QR code
```

### Payments
```
POST   /api/payments           - Tạo payment và redirect VNPay
POST   /api/payments/vnpay-ipn - VNPay IPN callback (webhook)
GET    /api/payments/vnpay-return - VNPay return URL
```

### Email
```
POST   /api/mail/send-reset-password - Gửi OTP reset password
                                       Body: { email: string }
                                       Response: OTP gửi qua email (5 phút expire)
                                       Rate limit: 5 lần/15 phút
```

### Destinations
```
GET    /api/destinations       - Lấy danh sách điểm đến
GET    /api/destinations/:id   - Lấy chi tiết điểm đến
POST   /api/destinations       - Tạo điểm đến (Admin only)
PATCH  /api/destinations/:id   - Cập nhật điểm đến (Admin only)
DELETE /api/destinations/:id   - Xóa điểm đến (Admin only)
```

### Reviews
```
GET    /api/reviews            - Lấy danh sách reviews
GET    /api/reviews/:id        - Lấy chi tiết review
POST   /api/reviews            - Tạo review (User đã booking)
PATCH  /api/reviews/:id        - Cập nhật review (Owner only)
DELETE /api/reviews/:id        - Xóa review
```

### Upload
```
POST   /api/upload/images      - Upload ảnh lên Cloudinary
                                 Content-Type: multipart/form-data
                                 Field name: images[]
```

**Swagger Documentation**: Truy cập `http://localhost:3000/docs` để xem chi tiết tất cả endpoints, request/response schemas, và test trực tiếp.

## 🔒 Bảo mật

### Implemented Security Features

1. **Authentication & Authorization**
   - JWT tokens với expiration (mặc định 7 ngày)
   - Passport strategies (Local, JWT)
   - CASL ability-based authorization
   - Role-based access control (Admin, User)

2. **Rate Limiting (3-Tier Protection)**
   ```typescript
   // Short-term: 10 requests/minute
   { ttl: 60000, limit: 10 }
   
   // Medium-term: 500 requests/30 minutes
   { ttl: 1800000, limit: 500 }
   
   // Long-term: 1000 requests/hour
   { ttl: 3600000, limit: 1000 }
   ```

3. **Security Headers (Helmet)**
   - Content Security Policy (CSP)
   - HTTP Strict Transport Security (HSTS)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: no-referrer

4. **Data Protection**
   - Password hashing với bcryptjs
   - Soft delete (dữ liệu không bị xóa vĩnh viễn)
   - MongoDB transactions cho ACID operations
   - Input validation với class-validator
   - OTP reset password với Redis expiration (5 phút)
   - Email rate limiting: 5 requests/15 phút

5. **Concurrency Control**
   - Redis distributed locks cho booking system
   - Timeout 15 seconds mặc định
   - Retry logic với exponential backoff (5 attempts)

6. **Payment Security**
   - VNPay signature verification
   - Secure hash algorithm (SHA256/SHA512)
   - IPN callback validation

7. **Email Security**
   - OTP with short expiration (5 minutes)
   - Rate limiting on reset password requests
   - Secure email templates without sensitive data exposure

### Best Practices

- Sử dụng environment variables cho sensitive data
- Không commit `.env` file lên repository
- Thay đổi JWT_SECRET trên production
- Sử dụng HTTPS trên production
- Regular dependency updates
- Monitor logs cho suspicious activities
- **Email templates**: Đặt trong `src/shared/mailer/templates/` và config `nest-cli.json` để auto-copy khi build
- **Soft delete với aggregation**: Phải thêm manual filter `{ isDeleted: { $ne: true } }` vì plugin không tự động

## 🐛 Common Issues & Solutions

### 1. Email templates không tìm thấy sau build
**Lỗi**: `ENOENT: no such file or directory, open 'dist/shared/shared/mailer/templates/...'`

**Giải pháp**:
- Check `nest-cli.json` có config `assets` để copy file `.hbs`
- Đảm bảo `dir: join(__dirname, 'templates')` trong `mail.module.ts`
- Rebuild: `npm run build`

### 2. Soft delete không hoạt động với aggregation
**Vấn đề**: Tour đã xóa (`isDeleted: true`) vẫn hiện trong `findAll()` khi dùng `aggregate()`

**Giải pháp**: Thêm manual filter:
```typescript
const matchStage = { 
  ...filter, 
  isDeleted: { $ne: true } // ✅ Phải thêm khi dùng aggregate
};
```

### 3. Dependency injection không tìm thấy service
**Lỗi**: `Nest can't resolve dependencies of the XService (..., YService, ...)`

**Giải pháp**:
1. Export service từ module chứa nó
2. Import module đó vào module cần dùng
3. Nếu dùng Mongoose model, phải `MongooseModule.forFeature([{ name: X, schema: XSchema }])` trong module cần dùng

### 4. VNPay payment callback không hoạt động
**Check**:
- `VNPAY_RETURN_URL` phải là public URL (dùng ngrok khi dev local)
- Verify signature trong `handleVnpayIpn()`
- Check logs để debug

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 License

Nest is [MIT licensed](LICENSE).

## 👤 Author

- **Nekko**

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!
