# Cart, Checkout & Order Architecture

## 20. Cart Architecture

The customer has one cart, but it may contain products from several sellers:

```
CART

Seller A
 ├── Shoes
 └── Shirt

Seller B
 └── Phone

Seller C
 └── Bag
```

At checkout, the system splits the cart logically.

## 21. Parent Order + Seller Orders

One of the most important technical decisions. The customer creates:

```
ORDER #10045
```

But internally:

```
ORDER #10045
│
├── SELLER ORDER #10045-A
│      ├── Shoes
│      └── Shirt
│
├── SELLER ORDER #10045-B
│      └── Phone
│
└── SELLER ORDER #10045-C
       └── Bag
```

The customer sees **Order #10045**. Each seller sees only their own seller order.

## 22. Why This Matters

Suppose Seller A hasn't accepted the order, but Seller B has already shipped. There
cannot be one status for the entire transaction. Therefore:

- **Parent Order** — tracks the overall customer purchase.
- **Seller Order** — tracks each merchant's fulfillment.
- **Delivery** — tracks the physical delivery of each fulfillment group.

## 23. Order State Machine (Parent Order)

```
CREATED
 ↓
PAYMENT_PENDING
 ↓
PAID
 ↓
PROCESSING
 ↓
PARTIALLY_FULFILLED
 ↓
FULFILLED
 ↓
COMPLETED
```

Terminal states: `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `DISPUTED`.

## 24. Seller Order State Machine

```
PENDING
 ↓
ACCEPTED
 ↓
PROCESSING
 ↓
READY_FOR_PICKUP
 ↓
HANDED_TO_RIDER
 ↓
COMPLETED
```

Alternative: `REJECTED`, `CANCELLED`.

## 25. Delivery State Machine

Delivery is separate from order:

```
CREATED
 ↓
AWAITING_ASSIGNMENT
 ↓
RIDER_ASSIGNED
 ↓
RIDER_ACCEPTED
 ↓
GOING_TO_PICKUP
 ↓
ARRIVED_AT_PICKUP
 ↓
PICKED_UP
 ↓
IN_TRANSIT
 ↓
ARRIVED_AT_DESTINATION
 ↓
DELIVERED
```

Failure states: `FAILED`, `CUSTOMER_UNAVAILABLE`, `CANCELLED`, `RETURNED`.

## 69. Multi-Seller Delivery (Checkout Fee Breakdown)

Important business decision: if a cart contains Seller A, Seller B, and Seller C,
there are potentially Delivery A, Delivery B, and Delivery C — so the customer might
pay multiple delivery fees. Checkout should clearly explain this:

```
Seller A
Products        ₵300
Delivery        ₵20

Seller B
Products        ₵200
Delivery        ₵25

Total           ₵545
```

Later, combined deliveries can be built when sellers are nearby (see
`08-delivery-and-logistics-architecture.md`, §70).
