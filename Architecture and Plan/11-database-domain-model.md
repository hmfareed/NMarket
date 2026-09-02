# Database Domain Model (MongoDB)

## 51. MongoDB Document Architecture

The database architecture uses **MongoDB** (with MongoDB Atlas / Replica Set for multi-document ACID transactions). Instead of heavy relational normalization across 25+ tables, the data model leverages **embedding** for tightly coupled sub-entities (e.g. cart items, order line items, address snapshots, product variants) and **referencing** for independently queried or high-churn domains (e.g. users, stores, financial ledgers, deliveries).

### Embedding vs. Referencing Strategy

| Domain | Pattern | Strategy & Rationale |
|---|---|---|
| **User Profiles & Addresses** | `users` collection | Customer, Seller, Rider, and Admin profiles share authentication in `users`. Customer addresses are embedded subdocuments with GeoJSON coordinates. |
| **Store & Settings** | `stores` collection | Referenced by `sellerId`. Embeds operating hours, fulfillment settings, and performance cache. |
| **Catalog & Inventory** | `products` collection | Embeds variants, pricing, and two-tier inventory (`onHand`, `reserved`, `available`). Includes GeoJSON `Point` for `2dsphere` distance indexing. |
| **Shopping Cart** | `carts` collection | 1 document per user/session. Embeds `items` array directly. Fast reads/writes without joins. |
| **Parent & Seller Orders** | `orders` collection | Parent Order document embeds immutable snapshot of customer address, payment details, and an array of `sellerOrders` (with their respective embedded `items`). |
| **Delivery & Logistics** | `deliveries` collection | Referenced by `orderId` and `sellerOrderId`. Tracks assigned rider, delivery route coordinates, status history milestones, and customer verification OTP. |
| **Financial Ledger** | `wallets` & `wallet_transactions` | Separate collections. Balances are verified against an immutable transaction ledger. |
| **Delivery Zones & Regions** | `delivery_zones` collection | Stores GeoJSON `Polygon` or `MultiPolygon` boundaries for native `$geoWithin` containment queries. |
| **Trust, Safety & Governance** | `reviews`, `disputes`, `audit_logs` | Independent collections referenced by entity IDs. |

---

## 52. Core Collections & Document Schemas

### 1. `users`
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "phone": "+233500000000",
  "passwordHash": "string",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "customerProfile": {
    "firstName": "Mohammed",
    "lastName": "Fareed",
    "avatarUrl": "string"
  },
  "addresses": [
    {
      "_id": "ObjectId",
      "label": "Home",
      "recipient": "Mohammed",
      "phone": "+233500000000",
      "region": "Northern Region",
      "city": "Tamale",
      "area": "Jisonayili",
      "landmark": "Near XYZ School",
      "deliveryInstructions": "Call when you reach the junction",
      "location": {
        "type": "Point",
        "coordinates": [-0.8393, 9.4008]
      },
      "isDefault": true
    }
  ],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2. `stores`
```json
{
  "_id": "ObjectId",
  "sellerId": "ObjectId (ref: users)",
  "name": "Tamale Tech Mart",
  "slug": "tamale-tech-mart",
  "description": "string",
  "logoUrl": "string",
  "bannerUrl": "string",
  "verificationStatus": "VERIFIED",
  "location": {
    "type": "Point",
    "coordinates": [-0.8393, 9.4008]
  },
  "address": {
    "region": "Northern Region",
    "city": "Tamale",
    "area": "Lamashegu",
    "pickupAddress": "Central Commercial Road, Shop #14"
  },
  "deliverySettings": {
    "supportsLocalDelivery": true,
    "prepTimeMinutes": 30,
    "operatingHours": {
      "mon": { "open": "08:00", "close": "18:00" },
      "tue": { "open": "08:00", "close": "18:00" }
    }
  },
  "performance": {
    "rating": 4.8,
    "totalOrders": 142,
    "acceptanceRate": 0.98,
    "score": 96
  },
  "createdAt": "ISODate"
}
```

### 3. `products`
```json
{
  "_id": "ObjectId",
  "storeId": "ObjectId (ref: stores)",
  "categoryId": "ObjectId (ref: categories)",
  "name": "Samsung Galaxy A15",
  "slug": "samsung-galaxy-a15",
  "description": "string",
  "brand": "Samsung",
  "status": "PUBLISHED",
  "price": 2500.00,
  "compareAtPrice": 2700.00,
  "images": [
    { "url": "string", "isPrimary": true, "thumbnailUrl": "string" }
  ],
  "variants": [
    {
      "sku": "SAM-A15-128-BLK",
      "name": "128GB Black",
      "price": 2500.00,
      "inventory": {
        "onHand": 15,
        "reserved": 2,
        "available": 13
      }
    }
  ],
  "inventory": {
    "onHand": 15,
    "reserved": 2,
    "available": 13,
    "lowStockThreshold": 3
  },
  "location": {
    "type": "Point",
    "coordinates": [-0.8393, 9.4008]
  },
  "createdAt": "ISODate"
}
```

### 4. `orders`
```json
{
  "_id": "ObjectId",
  "orderNumber": "NM-10045",
  "customerId": "ObjectId (ref: users)",
  "status": "PAID",
  "payment": {
    "provider": "PAYSTACK",
    "providerReference": "pstk_ref_98124981",
    "method": "MOBILE_MONEY",
    "amount": 545.00,
    "status": "SUCCESS",
    "verifiedAt": "ISODate"
  },
  "shippingAddress": {
    "recipient": "Salifu",
    "phone": "+233501234567",
    "area": "Vittin",
    "city": "Tamale",
    "location": {
      "type": "Point",
      "coordinates": [-0.8250, 9.3800]
    },
    "landmark": "Opposite Total filling station",
    "deliveryInstructions": "Call upon arrival"
  },
  "sellerOrders": [
    {
      "sellerOrderId": "NM-10045-A",
      "storeId": "ObjectId (ref: stores)",
      "sellerId": "ObjectId (ref: users)",
      "status": "ACCEPTED",
      "items": [
        {
          "productId": "ObjectId (ref: products)",
          "variantSku": "SAM-A15-128-BLK",
          "name": "Samsung Galaxy A15 (128GB Black)",
          "unitPrice": 2500.00,
          "quantity": 1,
          "totalPrice": 2500.00
        }
      ],
      "subtotal": 2500.00,
      "deliveryFee": 20.00,
      "commissionAmount": 250.00,
      "sellerEarning": 2250.00,
      "deliveryId": "ObjectId (ref: deliveries)"
    }
  ],
  "totalProductAmount": 2500.00,
  "totalDeliveryFee": 20.00,
  "totalAmount": 2520.00,
  "createdAt": "ISODate"
}
```

### 5. `deliveries`
```json
{
  "_id": "ObjectId",
  "orderId": "ObjectId (ref: orders)",
  "sellerOrderId": "NM-10045-A",
  "riderId": "ObjectId (ref: users, optional)",
  "status": "IN_TRANSIT",
  "verificationOtp": "4821",
  "pickupLocation": {
    "storeId": "ObjectId (ref: stores)",
    "location": { "type": "Point", "coordinates": [-0.8393, 9.4008] },
    "addressText": "Lamashegu Market, Shop 14"
  },
  "dropoffLocation": {
    "location": { "type": "Point", "coordinates": [-0.8250, 9.3800] },
    "landmark": "Opposite Total filling station",
    "recipient": "Salifu",
    "phone": "+233501234567"
  },
  "statusTimeline": [
    { "status": "AWAITING_ASSIGNMENT", "timestamp": "ISODate" },
    { "status": "RIDER_ASSIGNED", "timestamp": "ISODate" },
    { "status": "PICKED_UP", "timestamp": "ISODate" }
  ],
  "deliveredAt": null
}
```

### 6. `wallets` & `wallet_transactions`
```json
// wallets
{
  "_id": "ObjectId",
  "sellerId": "ObjectId (ref: users)",
  "pendingBalance": 2250.00,
  "availableBalance": 5400.00,
  "withdrawnTotal": 12000.00,
  "updatedAt": "ISODate"
}

// wallet_transactions
{
  "_id": "ObjectId",
  "walletId": "ObjectId (ref: wallets)",
  "sellerId": "ObjectId (ref: users)",
  "orderId": "ObjectId (ref: orders)",
  "sellerOrderId": "NM-10045-A",
  "type": "ORDER_CREDIT",
  "amount": 2250.00,
  "status": "PENDING",
  "description": "Payout for Seller Order NM-10045-A",
  "createdAt": "ISODate"
}
```

### 7. `delivery_zones`
```json
{
  "_id": "ObjectId",
  "name": "Tamale Central",
  "baseFee": 20.00,
  "estimatedTimeMinutes": 90,
  "boundary": {
    "type": "Polygon",
    "coordinates": [
      [
        [-0.8500, 9.4000],
        [-0.8300, 9.4200],
        [-0.8100, 9.4000],
        [-0.8300, 9.3800],
        [-0.8500, 9.4000]
      ]
    ]
  },
  "isActive": true
}
```

---

## 53. Geospatial & Compound Indexes

To support high performance and hyper-local search without full scans:

```javascript
// products: 2dsphere index for local proximity ranking
db.products.createIndex({ location: "2dsphere" });
db.products.createIndex({ status: 1, categoryId: 1, price: 1 });

// stores: 2dsphere index for store locator & delivery coverage
db.stores.createIndex({ location: "2dsphere" });
db.stores.createIndex({ sellerId: 1, status: 1 });

// delivery_zones: 2dsphere index for polygon boundary matching
db.delivery_zones.createIndex({ boundary: "2dsphere" });

// orders: quick queries by customer and orderNumber
db.orders.createIndex({ customerId: 1, createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ "sellerOrders.sellerId": 1, "sellerOrders.status": 1 });

// deliveries: rider assignment queue
db.deliveries.createIndex({ status: 1, riderId: 1 });
```
