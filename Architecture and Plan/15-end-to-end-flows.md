# End-to-End Flows

## 77. The Customer's Complete Flow

```
Open app
 ↓
Set location
 ↓
Browse/search
 ↓
Find nearby product
 ↓
View product
 ↓
View seller
 ↓
Add to cart
 ↓
Checkout
 ↓
Choose address
 ↓
Calculate delivery
 ↓
Payment
 ↓
Order created
 ↓
Seller accepts
 ↓
Seller prepares
 ↓
Ready
 ↓
Rider assigned
 ↓
Pickup
 ↓
Delivery
 ↓
OTP
 ↓
Delivered
 ↓
Review
```

## 78. The Seller's Complete Flow

```
Register
 ↓
Verify account
 ↓
Complete seller application
 ↓
Admin reviews
 ↓
Approved
 ↓
Create store
 ↓
Add products
 ↓
Admin/product moderation
 ↓
Products published
 ↓
Receive order
 ↓
Accept
 ↓
Prepare
 ↓
Ready
 ↓
Rider pickup
 ↓
Order delivered
 ↓
Funds become available
 ↓
Request payout
```

## 79. The Admin's Complete Flow

```
Admin login
 ↓
Dashboard
 ↓
Seller applications
 ↓
Review seller
 ↓
Verify
 ↓
Seller creates store
 ↓
Products submitted
 ↓
Moderate products
 ↓
Marketplace live
 ↓
Monitor orders
 ↓
Monitor delivery
 ↓
Handle disputes
 ↓
Manage payments
 ↓
Release payouts
 ↓
Analytics
```

## 80. The Complete Order Flow

Combining everything:

```
CUSTOMER
   │
   ▼
Add products
   │
   ▼
Cart
   │
   ▼
Checkout
   │
   ▼
Delivery calculation
   │
   ▼
Payment
   │
   ▼
PAYMENT VERIFIED
   │
   ▼
PARENT ORDER CREATED
   │
   ├──────────────┐
   ▼              ▼
SELLER A       SELLER B
   │              │
   ▼              ▼
Accept          Accept
   │              │
   ▼              ▼
Prepare         Prepare
   │              │
   ▼              ▼
Ready           Ready
   │              │
   ▼              ▼
DELIVERY A     DELIVERY B
   │              │
   ▼              ▼
RIDER           RIDER
   │              │
   └──────┬───────┘
          ▼
      CUSTOMER
          │
          ▼
       DELIVERED
          │
          ▼
      SETTLEMENT
          │
          ▼
       REVIEW
```

That is the core engine of the business.
