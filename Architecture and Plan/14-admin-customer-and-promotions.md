# Admin Dashboard, Customer Account, Promotions & Support

## 64. Admin Dashboard KPIs

Main dashboard:

```
GMV                    ₵125,450
Orders                 1,284
Customers              8,420
Active Sellers         312
Today's Orders         82
Pending Sellers        17
Pending Payouts        ₵24,500
Average Delivery       2h 14m
```

Plus charts: Sales, Orders, Customers, Delivery time, Seller performance.

## 65. Seller Analytics

Seller sees: Revenue, Orders, Units sold, Average order value, Conversion rate, Top
products, Low stock, Customer ratings, Cancellation rate. Don't expose sensitive
marketplace-wide information to individual sellers.

## 66. Customer Account

Navigation: Home, Categories, Search, Cart, Orders, Wishlist, Notifications, Account.

**Account section:** Profile, Addresses, Payment methods, Orders, Wishlist, Reviews,
Notifications, Security, Help, Logout.

## 67. Customer Address System

Don't only store `"Tamale"` — store actual delivery destinations:

```
Address
├── Label
├── Recipient
├── Phone
├── Region
├── City
├── Area
├── GPS
├── Landmark
├── Address text
└── Delivery instructions
```

Example:

```
Home
Near XYZ School
Jisonayili
Tamale
```

## 68. Delivery Instructions

Customer could provide free text like *"Call me when you reach the junction."* This
becomes part of the delivery record.

## 71. Promotions

Admin should be able to create:

- **Coupon** — e.g. `WELCOME10`, 10% off
- **Product discount** — e.g. ₵500 → ₵450
- **Free delivery** — e.g. orders over ₵300
- **Store promotion** — e.g. "Tamale Fashion Week"

## 72. Promotion Ownership

A promotion can belong to: Platform, Seller, Category, or Product. This distinction
matters financially — if a seller creates a "20% off" promotion, the seller should
bear the discount unless configured otherwise.

## 74. Customer Support

Build a support center:

```
Help Center
  My Orders
  Payments
  Delivery
  Returns
  Seller issues
  Account
```

Later: Support tickets, Live chat, WhatsApp support.
