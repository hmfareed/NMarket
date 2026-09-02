# Inventory & Concurrency

## 19. Inventory Architecture

Every product must have inventory. Example:

```
Product:  Nike Air Max
SKU:      NIKE-AM-BLK-42
Stock:    15
Reserved: 2
Available: 13
```

Important distinction: **available stock ≠ physical stock**.

```
available = onHand - reserved
```

Flow:

```
15 on hand
↓
2 reserved (order placed)
↓
13 available
```

- When an order is **cancelled** → reserved is released.
- When an order is **fulfilled** → onHand decreases.

This prevents overselling.

## 59. Inventory Concurrency

This deserves special attention.

Imagine: only 1 phone remains, and two customers click "Buy" simultaneously. The
backend must prevent both from successfully purchasing the same item — i.e. it must
never allow:

```
Customer A → buys
Customer B → buys
```

both to succeed on the same unit.

**Use atomic stock operations and reservation logic with MongoDB**:
In MongoDB, use an atomic conditional decrement on `inventory.available` at the moment of reservation:

```javascript
const res = await db.collection("products").updateOne(
  {
    _id: productId,
    "inventory.available": { $gte: quantityRequested }
  },
  {
    $inc: {
      "inventory.available": -quantityRequested,
      "inventory.reserved": quantityRequested
    }
  }
);
if (res.modifiedCount === 0) {
  throw new Error("Insufficient stock: Item was claimed by another customer.");
}
```

This atomic operation executes in a single round-trip without race conditions or table-wide locking. When checking out across multiple items, combine this within a MongoDB multi-document ACID transaction session.

