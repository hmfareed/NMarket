# Business Model & Actors

## 1. The Master Business Architecture

At the highest level, the platform has 5 major actors:

```
                    ┌─────────────────────┐
                    │      PLATFORM       │
                    │   SUPER ADMIN       │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
      CUSTOMER              SELLER                RIDER
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                               ▼
                       DELIVERY NETWORK
```

And behind everything:

```
                    PLATFORM
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Marketplace        Payments         Logistics
       │               │                │
       ▼               ▼                ▼
 Products           Wallets          Delivery
 Stores             Payouts          Tracking
 Sellers            Refunds          Riders
```

The system therefore isn't merely:

`Customer → Product → Payment`

It is:

`Customer → Marketplace → Seller → Product → Order → Payment → Fulfillment → Delivery → Rider → Customer → Settlement`

## 2. Business Model

This is a **multi-vendor marketplace**. The platform itself doesn't own the products.

```
Seller owns product
       ↓
Seller lists product
       ↓
Platform provides marketplace
       ↓
Customer buys
       ↓
Seller fulfills
       ↓
Platform facilitates payment + delivery
       ↓
Platform earns commission / fees
```

This is the marketplace model used by large platforms, optimized for local commerce.

## 3. Primary Value Proposition

Four pillars:

1. **Local** — Customers find sellers close to them.
2. **Fast** — Nearby sellers can fulfill orders quickly.
3. **Trusted** — Sellers are verified.
4. **Convenient** — Customers don't have to physically visit multiple markets/stores.

Positioning: *"Shop from trusted local businesses and get your products faster."*

## 4. Business Participants — Platform Owner

You. Responsibilities:

- Marketplace management
- Seller verification
- Product moderation
- Commission configuration
- Payment management
- Delivery management
- Dispute resolution
- Customer support
- Platform analytics

## 5. Sellers

A seller is an independent merchant.

```
Seller Account
      │
      └── Store
            │
            ├── Products
            ├── Orders
            ├── Inventory
            ├── Reviews
            ├── Earnings
            └── Delivery settings
```

One seller can potentially own multiple stores later, but the MVP enforces:

**One seller → one primary store** (keeps the MVP simpler).

## 6. Customers

Customers can:

- Browse without an account
- Create account
- Set location
- Browse products
- Search
- Add to cart
- Checkout
- Pay
- Track orders
- Review purchases
- Save addresses
- Wishlist products
- Follow stores (later)

## 7. Riders

Riders are responsible for physical movement of goods. Eventually:

```
Rider
 ├── Profile
 ├── Verification
 ├── Vehicle
 ├── Availability
 ├── Current GPS
 ├── Assigned deliveries
 ├── Earnings
 └── Delivery history
```

Don't make your own rider network mandatory for V1. Initially use:

- Seller-arranged delivery
- Local delivery partners
- Third-party logistics
- Approved riders

Then gradually build your own network.

## 8. Admin Roles

Don't create only one giant admin account — use RBAC:

- **Super Admin** — Full access.
- **Operations Admin** — Orders + delivery.
- **Seller Admin** — Seller verification and seller management.
- **Product Admin** — Catalog and product moderation.
- **Finance Admin** — Payments, payouts, refunds.
- **Customer Support** — Customers, orders, and disputes.
- **Marketing Admin** — Promotions, coupons, and banners.
