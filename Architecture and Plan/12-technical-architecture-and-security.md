# Technical Architecture, Structure & Security

## 53. Technical Architecture

Recommended stack:

**Frontend:** Next.js, React, TypeScript, Tailwind, shadcn/ui
**Backend:** Next.js API / Node.js, TypeScript
**Database:** MongoDB (MongoDB Atlas / Replica Set for multi-document ACID transactions)
**ODM / ORM:** Mongoose / Prisma (MongoDB provider)
**Storage:** S3-compatible storage / Cloudinary
**Payments:** Ghana payment gateway (Paystack / Hubtel / Flutterwave)
**Maps:** Google Maps / Mapbox
**Authentication:** Clerk / Auth.js / custom auth
**Notifications:** Push + SMS + Email
**Caching:** Redis
**Background Jobs:** Queue system (BullMQ / Redis)
**Deployment:** Vercel + MongoDB Atlas + managed Redis

### Why MongoDB and How It Is Designed

MongoDB is selected for NMarket's hyper-local marketplace due to:
1. **Native Geospatial Capabilities (`2dsphere`)**: Built-in GeoJSON indexing supports `$near` and `$geoWithin` queries for rapid distance-based ranking and delivery zone polygon validation without external GIS engines.
2. **Atomic Inventory Reservation**: Conditional `$inc` operations prevent overselling natively without table-wide locks.
3. **Flexible Product Catalogs**: Supports polymorphic product attributes and variants across diverse retail categories without complex EAV schemas.
4. **Multi-Document ACID Transactions**: For multi-collection operations (such as checking out parent/seller orders or processing wallet payouts), MongoDB multi-document transactions ensure full atomicity across replica sets.

## 54. Application Structure

Logical separation:

```
/apps
  /customer
  /seller
  /admin
  /rider
```

Shared infrastructure:

```
/packages
  /ui
  /database
  /auth
  /payments
  /maps
  /notifications
  /orders
  /inventory
  /delivery
```

These can be deployed as separate applications or start as one Next.js application
with role-based route groups. **For MVP, choose the latter** to reduce complexity.

## 55. Route Structure

**Public / Customer**
```
/
 /shop
 /categories
 /product/[slug]
 /store/[slug]

 /cart
 /checkout
 /orders
 /orders/[id]

 /account
 /account/addresses
 /account/wishlist
 /account/notifications
```

**Seller**
```
/seller
/seller/orders
/seller/products
/seller/inventory
/seller/store
/seller/earnings
/seller/payouts
/seller/reviews
/seller/settings
```

**Admin**
```
/admin
/admin/sellers
/admin/products
/admin/orders
/admin/customers
/admin/payments
/admin/delivery
/admin/riders
/admin/payouts
/admin/disputes
/admin/reports
/admin/settings
```

**Rider**
```
/rider
/rider/deliveries
/rider/deliveries/[id]
/rider/earnings
/rider/profile
```

## 56. API Architecture

Organize APIs by domain rather than creating random endpoints:

```
/api/auth

/api/products
/api/categories
/api/stores
/api/sellers

/api/cart

/api/orders
/api/order-items

/api/payments
/api/refunds

/api/inventory

/api/delivery
/api/riders

/api/payouts
/api/wallet

/api/reviews

/api/notifications

/api/admin
```

## 57. Security Architecture

Every request should go through:

```
Authentication
      ↓
Authorization
      ↓
Validation
      ↓
Business rules
      ↓
Database operation
```

Example: a seller requests `GET /api/orders`. The server must determine *which*
seller this is, then return only orders belonging to that seller. **Never rely on the
frontend to enforce this.**

## 58. Role-Based Access Control

Roles:

```
CUSTOMER
SELLER
RIDER
SUPPORT
PRODUCT_ADMIN
FINANCE_ADMIN
OPERATIONS_ADMIN
SUPER_ADMIN
```

Permissions (examples):

```
orders.read
orders.update
products.create
products.approve
sellers.verify
payouts.approve
refunds.process
delivery.assign
users.suspend
```

This is far more scalable than `if user.role === "admin"` scattered everywhere.
