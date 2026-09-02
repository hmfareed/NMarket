# Northern Ghana Marketplace — Master Architecture Index

This is the full platform architecture for a multi-vendor marketplace built to solve
Jumia's long delivery times, launching in Tamale (Northern Region) and expanding to
other regions afterward. It has been split from one long master document into
focused files, one per domain, so each can be handed to a coding agent independently
without dragging in unrelated context.

## How to use this

- Read `01` through `10` in order for the full product/business architecture.
- `11`–`13` are the technical backbone (data model, stack, security, engineering concerns).
- `14`–`15` cover the remaining product surfaces and the cross-role user flows.
- `16` is the roadmap: what to build first, what to explicitly skip, and the risks to watch.
- Feed these to your coding agent phase by phase, matching the MVP phase breakdown in `16`.

## File map

| File | Covers |
|---|---|
| `01-business-model-and-actors.md` | Master architecture, business model, value proposition, the 5 actors (platform owner, sellers, customers, riders, admin roles) |
| `02-geographic-and-location-architecture.md` | Location hierarchy (Region → District → City → Area → Delivery Zone), GPS data model, customer location flow |
| `03-marketplace-catalog-and-search.md` | Categories/brands/stores/products, product status state machine, search architecture, local-first search ranking |
| `04-seller-lifecycle-and-store-management.md` | Seller onboarding, verification, seller dashboard, store management, seller performance score, seller badges |
| `05-inventory-and-concurrency.md` | Inventory model (on-hand/reserved/available), overselling prevention |
| `06-cart-checkout-and-order-architecture.md` | Cart, multi-seller checkout, parent order vs. seller order split, order/seller-order/delivery state machines |
| `07-payments-commission-wallets-payouts-refunds.md` | Payment architecture, commission rules, seller wallet, payouts, refunds |
| `08-delivery-and-logistics-architecture.md` | Delivery types, zones, fee engine, eligibility, rider assignment, delivery verification (OTP), customer tracking, combined delivery |
| `09-reviews-ratings-and-trust-safety.md` | Reviews/ratings, seller reputation, trust & safety, dispute system, admin audit log, fraud prevention |
| `10-notifications-architecture.md` | Notification channels and events for customers, sellers, and admins |
| `11-database-domain-model.md` | Full entity list and core relationships |
| `12-technical-architecture-and-security.md` | Stack, app/route structure, API architecture, RBAC/security |
| `13-engineering-concerns.md` | Idempotency, background jobs, image pipeline, observability |
| `14-admin-customer-and-promotions.md` | Admin dashboard KPIs, seller analytics, customer account/address, promotions, customer support |
| `15-end-to-end-flows.md` | Full walk-throughs: customer flow, seller flow, admin flow, complete order flow |
| `16-mvp-roadmap-risks-and-vision.md` | 7-phase MVP build order, what to explicitly not build in V1, pilot plan, north star metric, biggest risks, the flywheel, final architecture diagram |

## Core principle carried through every file

> Separate the domains. Don't build one giant Order function that does everything.
> Identity → Location → Marketplace → Cart → Order → Payment → Inventory → Fulfillment → Delivery → Settlement → Review
>
> Each has its own rules and state transitions, but they communicate through well-defined events.
