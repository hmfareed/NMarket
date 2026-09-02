# Reviews, Ratings & Trust and Safety

## 40. Reviews

Reviews should be tied to verified purchases. A customer cannot simply review any
product — they must have:

```
Purchased + Order completed
```

Then: Product rating, Seller rating, Delivery rating. This allows seller reputation
to be calculated.

## 41. Seller Rating

Seller profile could show:

```
⭐ 4.8
1,240 orders

98%  Order acceptance
97%  On-time fulfillment
99%  Successful delivery
```

This creates marketplace trust.

## 48. Trust & Safety

Needs to be designed from the beginning.

**Seller moderation** — Verification, Suspension, Product moderation
**Customer protection** — Refunds, Disputes, Reviews
**Platform protection** — Fraud monitoring, Payment verification, Rate limiting,
Audit logs

## 49. Dispute System

Customer: *"I received the wrong product."*

```
Dispute #D1029
      ↓
Customer evidence
      ↓
Seller response
      ↓
Admin investigation
      ↓
Decision
      ↓
Resolution
```

Possible resolutions: No action, Partial refund, Full refund, Replacement, Seller
penalty, Seller suspension.

## 50. Admin Audit Log

Essential. Record important administrative actions:

```
Admin Mohammed   approved seller #123
Admin X          changed commission from 8% → 10%
Admin Y          refunded order #10452
Admin Z          suspended seller #88
```

You should always know: **who changed what, when, and why.**

## 73. Fraud Prevention

Eventually monitor:

- Multiple accounts
- Abnormal orders
- Excessive cancellations
- Payment anomalies
- Fake reviews
- Coupon abuse
- Seller manipulation
- Refund abuse

Don't over-engineer this in V1, but design the architecture so these signals can be
recorded from day one (event logs, not full detection logic).
