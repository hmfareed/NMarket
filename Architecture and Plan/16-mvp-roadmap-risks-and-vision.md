# MVP Roadmap, Risks & Vision

## 81. MVP — What to Actually Build First

Don't build everything at once.

**Phase 1 — Foundation**
- Authentication
- User roles
- Location system
- Database
- Admin foundation
- Seller registration
- Seller verification

**Phase 2 — Marketplace**
- Stores
- Categories
- Products
- Search
- Product details
- Seller pages

**Phase 3 — Shopping**
- Cart
- Checkout
- Addresses
- Payment
- Orders

**Phase 4 — Seller Operations**
- Seller dashboard
- Product management
- Inventory
- Order management
- Earnings

**Phase 5 — Delivery**
- Delivery zones
- Delivery pricing
- Delivery creation
- Rider/partner assignment
- Delivery statuses
- Customer tracking

**Phase 6 — Trust**
- Reviews
- Disputes
- Refunds
- Seller ratings
- Moderation

**Phase 7 — Growth**
- Coupons
- Promotions
- Wishlist
- Recommendations
- Seller analytics
- Customer analytics

## 82. What NOT to Build in V1

Avoid initially:

- AI recommendations
- Complex loyalty program
- Social feed
- Seller advertising platform
- Live rider map
- Advanced route optimization
- Multiple warehouses
- Subscriptions
- BNPL
- Complex seller tiers
- Nationwide logistics network

Get the basic transaction working first.

## 83. First Real-World Pilot

```
Location:   Tamale
Sellers:    20–50 verified sellers
Products:   500–2,000
Delivery:   Local riders/partners
Payment:    MoMo + card
Customer:   Tamale residents

Core promise: Fast local delivery
```

Then measure what actually happens.

## 84. North Star Metric

**Median order-to-door delivery time.**

```
Goal
Tamale local orders: < 4 hours

Excellent: < 2 hours
```

The exact target should come from the pilot. But the principle is important:

> Don't optimize only for GMV. Optimize for fulfillment speed and reliability.

## 85. The Biggest Risks

Five to worry about most:

1. **Not enough sellers** — Customers open the app and don't find products.
2. **Not enough customers** — Sellers don't receive orders.
3. **Poor seller fulfillment** — Seller takes 2 days to prepare something that
   should take 30 minutes.
4. **Delivery failures** — Riders can't locate customers, sellers aren't ready,
   customers aren't available.
5. **Trust** — One bad seller can damage customer confidence.

This is why seller verification + delivery reliability + customer protection should
be foundational, not an afterthought.

## 86. The Flywheel

```
More sellers
     ↓
More products
     ↓
More customers
     ↓
More orders
     ↓
More seller revenue
     ↓
More sellers join
     ↓
Higher product availability
     ↓
Faster local fulfillment
     ↓
Better customer experience
     ↓
More customers
```

That's the marketplace flywheel to aim for.

## 87. The Final Architecture

```
                         ┌────────────────────┐
                         │    SUPER ADMIN     │
                         └─────────┬──────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
           MARKETPLACE          FINANCE           OPERATIONS
                │                  │                  │
                │                  │                  │
       ┌────────┼────────┐         │            ┌─────┴─────┐
       ▼        ▼        ▼         ▼            ▼           ▼
    SELLERS  PRODUCTS  STORES   PAYMENTS     DELIVERY     RIDERS
       │        │        │         │            │           │
       └────────┼────────┘         │            └─────┬─────┘
                │                  │                  │
                ▼                  ▼                  ▼
             CUSTOMER ───────── ORDER ───────── DELIVERY
                │                  │                  │
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   ▼
                              TRUST SYSTEM
                         Reviews / Disputes / Refunds
```

And underneath:

```
                ┌──────────────────────────┐
                │       CORE PLATFORM      │
                ├──────────────────────────┤
                │ Auth & RBAC               │
                │ Location                  │
                │ Marketplace              │
                │ Orders                   │
                │ Inventory                │
                │ Payments                 │
                │ Wallets                  │
                │ Delivery                 │
                │ Notifications            │
                │ Reviews                  │
                │ Disputes                │
                │ Analytics                │
                │ Audit Logs               │
                └────────────┬─────────────┘
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
              MongoDB        Redis      Storage
                 │
                 ▼
         External Integrations
       Payment / Maps / SMS / Email
```

### The most important architectural principle

> Separate the domains. Don't build one giant Order function that does everything.
>
> `Identity → Location → Marketplace → Cart → Order → Payment → Inventory → Fulfillment → Delivery → Settlement → Review`
>
> Each has its own rules and state transitions, but they communicate through
> well-defined events.

That approach makes it possible to start with Tamale, operate with 20 sellers and a
handful of riders, and eventually scale the same platform to Northern Ghana and then
nationwide Ghana without throwing away the foundation.
