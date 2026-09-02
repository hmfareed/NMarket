# Payments, Commission, Wallets, Payouts & Refunds

## 26. Payment Architecture

Payment should be independent from orders:

```
Order
 ↓
Payment Intent
 ↓
Payment Provider
 ↓
Transaction
 ↓
Verification
 ↓
Payment Successful
 ↓
Order Paid
```

**Don't trust frontend payment responses.** The backend must verify payment with the
payment provider.

## 27. Payment Record

A transaction should contain:

```
Transaction
├── transactionId
├── orderId
├── customerId
├── amount
├── currency
├── provider
├── providerReference
├── status
├── paymentMethod
├── createdAt
└── verifiedAt
```

Statuses: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`.

## 28. Commission Architecture

Admin configures marketplace commission. Example:

```
Seller sale = ₵500
Commission  = 10%
Platform    = ₵50
Seller      = ₵450
```

Don't hard-code the rate. Create:

```
CommissionRule
├── category
├── seller
├── rate
├── fixedFee
├── active
└── effectiveFrom
```

This lets the rate change later.

## 29. Seller Wallet

The seller's wallet should contain:

- Pending balance
- Available balance
- Withdrawn balance
- Total earnings
- Platform fees
- Refund deductions

Flow:

```
Sale                ₵500
 ↓
Platform fee        ₵50
 ↓
Seller earning      ₵450
 ↓
Pending
 ↓
Order delivered
 ↓
Settlement period
 ↓
Available
```

## 30. Payouts

Seller requests: "Withdraw ₵1,500".

System checks: `Available balance >= ₵1,500`?

```
PAYOUT_REQUESTED
 ↓
UNDER_REVIEW
 ↓
PROCESSING
 ↓
PAID
```

Or: `FAILED`, `REJECTED`.

Finance admin should be able to approve/review payouts.

## 31. Refund Architecture

Refunds must support: full refund, partial refund, cancelled order, failed payment,
customer dispute, seller fault, delivery failure.

Example (full refund):

```
Order = ₵300
Customer receives wrong item
Admin approves refund
₵300 → Payment provider/customer balance
```

Example (partial refund):

```
Order    = ₵300
Refund   = ₵100
Remaining = ₵200
```
