# Seller Lifecycle & Store Management

## 15. Seller Onboarding

Seller onboarding is a workflow:

```
Create account
       ↓
Verify phone/email
       ↓
Seller application
       ↓
Personal/business information
       ↓
Store information
       ↓
Pickup location
       ↓
Payout information
       ↓
Submit application
       ↓
ADMIN REVIEW
       ↓
Approved / Rejected
```

Seller shouldn't be able to sell until approved.

## 16. Seller Verification

Seller profile:

```
Seller
├── Identity information
├── Contact information
├── Store information
├── Business type
├── Location
├── Verification status
├── Payout information
└── Admin notes
```

Statuses: `PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `SUSPENDED`.

## 17. Seller Dashboard

A seller's dashboard should show:

```
Good morning, Seller 👋

Today's sales      ₵1,250
Orders              12
Pending             4
Products            86
Low stock           7
Available balance  ₵4,520
```

Then navigation to: Orders, Products, Inventory, Customers, Store, Earnings, Payouts,
Reviews, Analytics, Settings.

## 18. Store Management

Seller can configure:

**Store identity**
- Store name
- Logo
- Cover image
- Description
- Phone
- WhatsApp
- Address

**Operating hours**

```
Monday       8:00–18:00
Tuesday      8:00–18:00
...
Sunday       Closed
```

**Fulfillment**
- Processing time
- Pickup availability
- Delivery zones
- Local delivery availability

## 75. Seller Performance Score

Calculated internally:

```
Seller Score =
Order acceptance
+
Fulfillment
+
On-time preparation
+
Cancellation
+
Customer rating
+
Dispute rate
```

Used for: search ranking, seller badges, suspension warnings, promotions.

## 76. Seller Badges

Examples:

- ✓ Verified
- ⚡ Fast Fulfillment
- 🏆 Top Seller
- 🚚 Same-Day Delivery
- ⭐ Highly Rated

This gives customers confidence.
