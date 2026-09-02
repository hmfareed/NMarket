# Engineering Concerns

(Inventory concurrency is covered separately in `05-inventory-and-concurrency.md`, §59.)

## 60. Idempotency

Payments and order creation must be idempotent.

Suppose a customer's internet freezes after payment and they retry — you must not
create two orders. Use idempotency keys:

```
checkoutRequestId
paymentReference
```

Essential for production.

## 61. Background Jobs

Some operations shouldn't happen during a normal request. Use jobs for:

- Send notifications
- Process emails
- Generate reports
- Release seller funds
- Payment reconciliation
- Inventory cleanup
- Search indexing
- Delivery updates

Later: recommendation engine, fraud detection, analytics processing.

## 62. Image Architecture

Seller uploads a product image. Don't store the image directly in the database:

```
Seller
 ↓
Upload
 ↓
Object storage
 ↓
Image URL
 ↓
Product.image
```

Generate: Thumbnail, Medium, Large. Optimize automatically.

## 63. Observability

Production system should track:

**Errors** — API errors, Payment failures, Database errors
**Performance** — API response time, Checkout latency, Search latency
**Business events** — Orders, Revenue, Seller activity, Delivery performance

Both technical monitoring and business monitoring are needed.
