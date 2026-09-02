# NMarket Ghana Marketplace — Master Business & Technical Architecture

## 1. Project Overview

Build a modern, scalable, location-aware multi-vendor e-commerce marketplace initially
focused on Tamale and the Northern Region of Ghana, with the architecture designed
from day one to expand to other regions and eventually become a nationwide Ghanaian
marketplace.

The platform connects customers with verified local sellers who operate physical or
online stores within their communities.

The primary problem the platform solves is the long delivery waiting time customers
often experience when purchasing products from sellers located far away. Instead of
primarily connecting customers with distant sellers, the platform prioritizes products
and sellers geographically close to the customer.

The core proposition is:

> **SHOP LOCAL. GET IT FASTER.**

A customer should be able to open the platform, provide or automatically detect their
location, discover products available near them, compare sellers, purchase products,
pay securely, and receive the order through a local delivery network.

The platform must support: Customers, Sellers, Seller stores, Products, Inventory,
Orders, Payments, Seller commissions, Seller wallets, Payouts, Delivery, Riders,
Location/GPS, Reviews, Disputes, Refunds, Notifications, Promotions, Analytics,
Administration, Seller verification, Product moderation.

The platform must be designed as a real marketplace, not as a simple single-store
e-commerce website.

## 2. Core Business Idea

The platform is a marketplace where independent sellers register and create digital
stores. The platform owner verifies the sellers before allowing them to sell.

**Verified sellers can:** create their stores, add products, set prices, manage stock,
receive orders, prepare orders, hand orders to riders, track sales, view earnings,
request payouts.

**Customers can:** browse products, search products, find nearby sellers, view
stores, add products to cart, checkout, pay, select delivery addresses, see delivery
fees, track orders, review products and sellers, report issues.

The platform owner controls the entire marketplace through a Super Admin panel.

## 3. Primary Differentiator

The platform must not simply attempt to copy Jumia. Its competitive advantage is
**LOCAL COMMERCE + FAST FULFILLMENT**.

The system should prioritize sellers based on:

1. Customer location
2. Seller location
3. Product availability
4. Delivery eligibility
5. Delivery speed
6. Seller reliability
7. Seller rating
8. Price
9. Product relevance

For example, if a customer in Tamale searches for a phone, the platform should
prioritize a verified phone seller in Tamale who can deliver today over a seller
located in Accra who may take several days. The marketplace therefore becomes
location-aware.

## 4. Initial Market

The initial launch should focus on Tamale, Tamale Metropolitan Area, and selected
surrounding communities. The platform should not initially attempt to cover every
part of Northern Ghana.

The first objective is to establish a dense marketplace in Tamale containing enough
sellers, products, customers, riders, and delivery coverage to make fast local
fulfillment possible.

After proving the model, expand to:

1. Other communities around Tamale
2. Northern Region
3. Upper East
4. Upper West
5. Other regions
6. Nationwide Ghana

The database and location architecture must support this expansion without requiring
a rewrite.

## 5. High-Level Platform Ecosystem

The platform consists of five primary actors: **Customer, Seller, Rider, Admin,
Platform.**

```
CUSTOMER
↓
Marketplace
↓
Seller / Store
↓
Product
↓
Cart
↓
Checkout
↓
Payment
↓
Order
↓
Seller Fulfillment
↓
Delivery
↓
Rider / Delivery Partner
↓
Customer
↓
Order Completion
↓
Seller Settlement
↓
Review
```

The platform sits in the middle and coordinates all of these processes.

## 6. Platform Applications

The system should consist of four major interfaces.

### 6.1 Customer Application
Discover products, search, browse categories, view stores, purchase products, pay,
manage addresses, track orders, review purchases, manage account.

### 6.2 Seller Dashboard
Each seller receives a private dashboard: store management, product management,
inventory management, order management, sales analytics, earnings, payouts, reviews,
store settings.

### 6.3 Admin Panel
The platform owner controls the entire marketplace: seller verification, product
moderation, order monitoring, payment monitoring, delivery management, rider
management, customer management, refunds, disputes, promotions, categories,
locations, delivery zones, commissions, analytics, platform settings.

### 6.4 Rider Application
Eventually allows: rider registration, verification, online/offline status, delivery
assignments, pickup navigation, delivery navigation, delivery confirmation, OTP
verification, earnings, delivery history. **Can be introduced after the marketplace
MVP.**

## 7. User Roles

The system must use role-based access control.

**Primary roles:** CUSTOMER, SELLER, RIDER, SUPPORT_ADMIN, PRODUCT_ADMIN,
OPERATIONS_ADMIN, FINANCE_ADMIN, SUPER_ADMIN.

Permissions must be granular, e.g.: `products.create`, `products.update`,
`products.delete`, `products.approve`, `sellers.verify`, `sellers.suspend`,
`orders.read`, `orders.update`, `payments.read`, `refunds.process`,
`payouts.approve`, `delivery.assign`, `riders.manage`, `customers.suspend`,
`reports.view`.

**Do not rely exclusively on frontend role checks. All permissions must be enforced
on the backend.**

## 8. Geographic Architecture

Location is a core part of the platform. Use a geographic hierarchy:

```
COUNTRY
↓
REGION
↓
DISTRICT / MUNICIPALITY
↓
CITY / TOWN
↓
AREA / COMMUNITY
↓
DELIVERY ZONE
```

Example: `Ghana → Northern Region → Tamale Metropolitan → Tamale → Lamashegu →
Delivery Zone A`

The same architecture must work for every region. **Do not hard-code Tamale into
business logic.**

## 9. Customer Location System

Customers should have two ways to provide their delivery location.

**GPS** — Customer clicks "Use my current location". The system:

1. Requests location permission
2. Gets latitude
3. Gets longitude
4. Performs reverse geocoding
5. Determines region
6. Determines city
7. Determines area
8. Determines delivery zone
9. Displays the detected address
10. Allows customer confirmation/editing

Example:
```
Latitude:  9.xxxxxx
Longitude: -0.xxxxxx
Region:    Northern Region
City:      Tamale
Area:      Lamashegu
Delivery Zone: Tamale Central
```

**Manual Location** — Customer can alternatively select: Region → City → Area →
Enter landmark/address. **GPS must never be the only option.**

## 10. Seller Location

Every seller must have a physical operating/pickup location containing: Region,
District, City, Area, Address, Landmark, Latitude, Longitude, Delivery zones, Pickup
availability.

This location is critical because the marketplace uses it to determine: nearby
products, delivery eligibility, estimated delivery time, delivery fee, search
ranking, rider assignment.

## 11. Delivery Zones

Administrators should be able to create delivery zones. Each zone can have: Name,
Region, City, Geographic boundary or radius, Base delivery fee, Distance fee,
Estimated delivery time, Active/inactive status.

Example:
```
Tamale Central:          ₵20   1–3 hours
Tamale Outer:             ₵30   Same-day
Surrounding Communities:  ₵45   1–2 days
```

These values must be configurable by the administrator.

## 12. Customer Account

Customer profile: Name, Phone, Email, Profile image, Account status, Default
address, Saved addresses, Wishlist, Order history, Reviews, Notifications.

Customer statuses: `ACTIVE`, `SUSPENDED`, `DEACTIVATED`.

## 13. Address System

Customers can have multiple addresses. Each address contains: Address ID, Label,
Recipient name, Phone, Region, District, City, Area, Landmark, Address description,
Latitude, Longitude, Delivery zone, Delivery instructions, Default status.

Example delivery instruction: *"Call me when you reach the junction."*

## 14. Seller Registration

Seller onboarding must be controlled.

```
REGISTER
↓
Verify phone/email
↓
Complete seller application
↓
Personal information
↓
Business information
↓
Store information
↓
Pickup location
↓
Payout information
↓
Submit application
↓
Admin review
↓
Approved / Rejected
```

A seller must not immediately become an active marketplace seller.

## 15. Seller Verification

Seller statuses: `PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `SUSPENDED`.

The admin should be able to inspect: Seller identity, Phone, Email, Business type,
Store name, Store location, Contact information, Submitted information, Payout
details, Admin notes.

The admin can: Approve, Reject, Request changes, Suspend, Reactivate.

## 16. Seller Store

Every approved seller receives a digital storefront containing: Store name, Logo,
Cover image, Description, Contact information, Location, Opening hours, Products,
Categories, Ratings, Reviews, Verification badge, Delivery information.

Store URL: `/store/store-slug`. The seller should be able to share their store
externally.

## 17. Seller Store Settings

Seller can manage: Store name, Logo, Cover image, Description, Phone, WhatsApp,
Address, Operating hours, Holiday hours, Processing time, Delivery availability,
Pickup availability.

The seller cannot change critical verification information without admin review.

## 18. Product Catalog

Products belong to stores. Product structure: Product ID, Seller ID, Store ID,
Category ID, Brand ID, Name, Slug, Description, Images, Price, Discount price, SKU,
Stock, Variants, Weight, Dimensions, Delivery eligibility, Status, Created date,
Updated date.

## 19. Product Variations

Products may have variations.

Examples: **Size** — S, M, L, XL. **Color** — Black, White, Red.

Each variation can have: SKU, Price, Stock, Image.

## 20. Product Moderation

```
DRAFT
↓
PENDING_REVIEW
↓
APPROVED
↓
PUBLISHED
```

Other states: `REJECTED`, `SUSPENDED`, `ARCHIVED`, `OUT_OF_STOCK`.

Admins should be able to review products before publication if marketplace policy
requires it.

## 21. Inventory System

Inventory must be centralized and transactional. Each product/variant should track:
On-hand quantity, Reserved quantity, Available quantity.

```
AVAILABLE = ON_HAND - RESERVED
```

- When customer places an order → available stock is reserved.
- When payment/order is confirmed → reservation remains active.
- When seller fulfills → physical stock is reduced.
- When order is cancelled → reservation is released.

The system must prevent two customers from purchasing the same final item
simultaneously.

## 22. Search System

Search should support: Product name, Description, Brand, Category, SKU, Tags,
Seller, Store — and results should be **location-aware**.

Ranking should consider:

1. Search relevance
2. Customer distance
3. Stock availability
4. Delivery speed
5. Seller rating
6. Seller reliability
7. Price
8. Product popularity

The closest seller should not automatically win if they have poor reliability or no
stock.

## 23. Marketplace Homepage

The customer homepage should dynamically respond to their location. Example
sections: Delivering to: Tamale, Search, Categories, Nearby Stores, Products Near
You, Same-Day Delivery, Trending in Tamale, Top Rated Sellers, Deals, Recommended
Products, Recently Viewed.

The homepage should emphasize local availability.

## 24. Product Details

Product page should display: Product images, Name, Price, Discount, Stock status,
Variations, Description, Seller, Seller rating, Seller location, Delivery estimate,
Delivery fee estimate, Return information, Reviews, Add to cart, Buy now.

Example: *"Available from Tamale Fashion Hub" · "2.8 km away" · "Same-day delivery
available"*

## 25. Cart System

Customer has one shopping cart, which may contain products from multiple sellers:

```
Seller A: Shirt, Shoes
Seller B: Phone
Seller C: Bag
```

The cart must group products by seller.

## 26. Multi-Seller Checkout

When the customer checks out, the system must logically split the cart into seller
orders:

```
PARENT ORDER #10001

Seller A Order: Shirt, Shoes
Seller B Order: Phone
Seller C Order: Bag
```

The customer sees one checkout/order experience. Each seller sees only their own
seller order.

## 27. Parent Order

Contains: Customer, Total amount, Payment status, Overall status, Shipping address,
Seller orders, Delivery groups, Discounts, Taxes/fees where applicable, Created
timestamp.

## 28. Seller Order

Each seller order belongs to one seller and contains: Seller, Parent order, Items,
Seller subtotal, Seller commission, Seller earnings, Fulfillment status, Delivery,
Customer delivery information.

**Seller A must never have access to Seller B's order information.**

## 29. Order Items

Each order item records a snapshot of the purchased product: Product ID, Product
name at purchase, SKU, Variant, Price at purchase, Quantity, Discount, Seller,
Product image, Total.

**Do not rely solely on the current product record** because the seller may change
the product later.

## 30. Order Status

**Parent order statuses:** `CREATED`, `PAYMENT_PENDING`, `PAID`, `PROCESSING`,
`PARTIALLY_FULFILLED`, `FULFILLED`, `COMPLETED`, `CANCELLED`, `REFUNDED`,
`PARTIALLY_REFUNDED`, `DISPUTED`.

**Seller order statuses:** `PENDING`, `ACCEPTED`, `PROCESSING`, `READY_FOR_PICKUP`,
`HANDED_TO_RIDER`, `COMPLETED`, `REJECTED`, `CANCELLED`.

## 31. Payment System

Payment is a separate domain:

```
CHECKOUT
↓
PAYMENT INTENT
↓
PAYMENT PROVIDER
↓
CUSTOMER PAYMENT
↓
PAYMENT VERIFICATION
↓
TRANSACTION SUCCESS
↓
ORDER PAID
↓
FULFILLMENT STARTS
```

The backend must verify payment. **Never trust only the frontend payment
response.**

## 32. Payment Methods

Initial payment methods can include: Mobile Money, Bank/card payments. Additional
methods can be added later. Payment provider integration must be abstracted so that
changing providers does not require rewriting the order system.

## 33. Transactions

Each payment transaction contains: Transaction ID, Order ID, Customer ID, Amount,
Currency, Payment method, Provider, Provider reference, Status, Created time,
Verification time.

Statuses: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`.

## 34. Commission System

The platform earns money by charging sellers commissions.

```
Product sale:  ₵500
Commission:    10%
Platform:      ₵50
Seller:        ₵450
```

Commission rules must be configurable — possible levels: Platform-wide,
Category-specific, Seller-specific, Product-specific. **Do not hard-code the
commission rate.**

## 35. Seller Wallet

Every seller has a wallet: Available balance, Pending balance, Total earnings,
Withdrawn amount, Platform fees, Refund deductions.

```
Sale:            ₵500
Commission:      ₵50
Seller earning:  ₵450
```

Seller earning becomes pending. After successful delivery and settlement period:
`Pending → Available`.

## 36. Payout System

```
PAYOUT_REQUESTED
↓
UNDER_REVIEW
↓
PROCESSING
↓
PAID
```

Possible: `REJECTED`, `FAILED`. The finance/admin team must be able to review
payout history.

## 37. Settlement

Do not immediately make every sale withdrawable:

```
Customer pays
↓
Order delivered
↓
Return/dispute window
↓
Funds released
↓
Seller available balance
↓
Seller requests payout
```

The settlement period should be configurable.

## 38. Refund System

Support: Full refund, Partial refund, Order cancellation refund, Failed payment,
Dispute refund, Seller fault, Delivery failure. Every refund must create a financial
record.

## 39. Delivery Architecture

Delivery is a separate domain, with two major delivery models initially.

**Local Delivery:** `Seller → Local rider → Customer` — used when seller and
customer are within supported local delivery zones.

**Nationwide Delivery:** `Seller → Courier/transport partner → Destination
region/city → Local delivery → Customer` — used when seller and customer are far
apart.

## 40. Delivery Fee Engine

**Basic V1:** `BASE FEE + DISTANCE/ZONE FEE`

**Advanced:** `BASE FEE + DISTANCE + WEIGHT + PACKAGE SIZE + URGENCY - PROMOTION`

Admin controls the pricing rules. The customer should see the delivery fee before
payment.

## 41. Delivery Estimation

Each delivery should have an estimated delivery time, e.g. "Delivery today",
"Within 3 hours", "Tomorrow", "2–4 days". Depends on: Seller location, Customer
location, Seller processing time, Delivery zone, Delivery method, Rider
availability, Nationwide courier.

## 42. Delivery Eligibility

Before checkout, determine whether the product can be delivered to the customer's
address. Check: Seller delivery zones, Customer zone, Product restrictions, Seller
availability, Delivery partner coverage.

If unavailable: *"Seller does not currently deliver to this location."*

## 43. Delivery Record

Contains: Delivery ID, Order ID, Seller order ID, Customer, Seller, Rider, Pickup
location, Destination, Pickup GPS, Destination GPS, Delivery fee, Estimated time,
Actual time, Status.

## 44. Delivery Status

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

Failure states: `CUSTOMER_UNAVAILABLE`, `FAILED`, `CANCELLED`, `RETURNED`.

## 45. Rider System

Rider profile: Name, Phone, Profile, Verification status, Vehicle type, Vehicle
information, Current location, Availability, Earnings, Delivery history.

Rider statuses: `OFFLINE`, `AVAILABLE`, `BUSY`, `SUSPENDED`.

## 46. Rider Assignment

```
Delivery created
↓
Find eligible riders
↓
Offer delivery
↓
Rider accepts
↓
Assignment confirmed
```

Filter by: Current location, Delivery zone, Vehicle, Availability, Current
workload. The assignment engine can become more sophisticated later.

## 47. Delivery Confirmation

```
Rider arrives
↓
Customer receives package
↓
Customer provides OTP
↓
Rider enters OTP
↓
System verifies
↓
Order marked delivered
```

Additional evidence can later include: GPS, Timestamp, Photo, Signature.

## 48. Customer Order Tracking

```
ORDER PLACED        ✓
SELLER CONFIRMED    ✓
PREPARING           ✓
READY FOR PICKUP    ✓
RIDER ASSIGNED      ✓
PICKED UP           ✓
ON THE WAY          ●
DELIVERED           ○
```

For local deliveries, live rider tracking can be introduced later.

## 49. Multi-Seller Delivery

If one cart contains three sellers, the system may generate three deliveries:

```
Seller A: Products ₵300, Delivery ₵20
Seller B: Products ₵200, Delivery ₵25
Seller C: Products ₵150, Delivery ₵20
```

The checkout clearly displays the breakdown. **Future optimization:** if sellers A
and B are nearby, one rider may collect both orders and perform one combined
delivery.

## 50. Reviews

Reviews are only allowed after verified purchases. Customer can review: Product,
Seller, Delivery experience. Reviews should contain: Rating, Comment, Images if
enabled, Order reference, Customer reference. Reviews can be moderated.

## 51. Seller Performance

Track: Order acceptance rate, Cancellation rate, Preparation time, Fulfillment
rate, Delivery success, Customer rating, Dispute rate, Return rate — this creates
seller reliability scoring.

## 52. Seller Badges

Possible badges: VERIFIED SELLER, TOP SELLER, HIGHLY RATED, FAST FULFILLMENT,
SAME-DAY DELIVERY. Badges can be automatically or manually assigned.

## 53. Dispute System

```
CUSTOMER CREATES DISPUTE
↓
Evidence submitted
↓
Seller notified
↓
Seller responds
↓
Admin investigates
↓
Decision
↓
Resolution
```

Possible resolutions: No action, Partial refund, Full refund, Replacement, Seller
penalty, Seller suspension.

## 54. Trust & Safety

The platform should have: Seller verification, Product moderation,
Purchase-verified reviews, Payment verification, Refund protection, Dispute
management, Seller suspension, Customer abuse controls, Fraud monitoring, Audit
logs.

Trust is critical because customers must feel safe buying from independent
sellers.

## 55. Notification System

Centralized, event-driven. Channels: In-app, Push, Email, SMS, WhatsApp (later).

Important events: `SELLER_APPROVED`, `PRODUCT_APPROVED`, `ORDER_CREATED`,
`PAYMENT_SUCCESSFUL`, `SELLER_ACCEPTED`, `ORDER_READY`, `RIDER_ASSIGNED`,
`ORDER_PICKED_UP`, `ORDER_DELIVERED`, `ORDER_CANCELLED`, `REFUND_PROCESSED`,
`PAYOUT_COMPLETED`.

## 56. Customer Notifications

Examples: *"Your order has been confirmed." · "Tamale Fashion Hub is preparing
your order." · "Your rider has picked up your order." · "Your order is arriving
soon." · "Your order has been delivered."*

## 57. Seller Notifications

Examples: *"You have received a new order." · "Payment has been confirmed." ·
"Your product is running low on stock." · "Customer cancelled an order." · "Your
payout has been completed."*

## 58. Admin Notifications

Examples: *"New seller application requires review." · "New product requires
moderation." · "Payment failure detected." · "Delivery failure reported." · "New
customer dispute." · "Payout requires review."*

## 59. Promotion System

Support: Coupons, Product discounts, Store discounts, Category discounts, Free
delivery, Minimum-spend promotions, Featured products, Campaigns.

Promotions must support ownership: Platform-funded, Seller-funded, Shared funding —
important for accounting.

## 60. Wishlist

Customers can save products. Can later support: Price-drop notifications,
Back-in-stock notifications, Promotion alerts.

## 61. Product Availability Alerts

Customer selects "Notify me when available." When inventory increases, a
notification is triggered.

## 62. Admin Panel Structure

```
ADMIN
├── Dashboard
├── Marketplace
│   ├── Products
│   ├── Categories
│   ├── Brands
│   └── Collections
├── Sellers
│   ├── All Sellers
│   ├── Pending Applications
│   ├── Verified
│   ├── Suspended
│   └── Seller Reviews
├── Stores
│   ├── All Stores
│   └── Store Moderation
├── Orders
│   ├── All Orders
│   ├── Pending
│   ├── Processing
│   ├── Ready
│   ├── In Delivery
│   ├── Delivered
│   ├── Cancelled
│   └── Disputed
├── Customers
│   ├── Customers
│   └── Suspended
├── Delivery
│   ├── Deliveries
│   ├── Riders
│   ├── Delivery Zones
│   ├── Delivery Pricing
│   └── Delivery Partners
├── Payments
│   ├── Transactions
│   ├── Refunds
│   ├── Seller Wallets
│   ├── Payouts
│   └── Commission
├── Marketing
│   ├── Promotions
│   ├── Coupons
│   ├── Banners
│   └── Featured Products
├── Reviews
│   ├── Product Reviews
│   ├── Seller Reviews
│   └── Reported Reviews
├── Disputes
│   ├── Open
│   ├── Investigating
│   └── Resolved
├── Locations
│   ├── Regions
│   ├── Districts
│   ├── Cities
│   ├── Areas
│   └── Delivery Zones
├── Reports
│   ├── Sales
│   ├── Orders
│   ├── Customers
│   ├── Sellers
│   ├── Products
│   ├── Delivery
│   └── Financial
├── Settings
│   ├── Platform
│   ├── Payments
│   ├── Delivery
│   ├── Commission
│   ├── Notifications
│   └── Security
└── Audit Logs
```

## 63. Admin Dashboard

Show: Total GMV, Platform revenue, Orders, Customers, Active sellers, Active
products, Pending seller applications, Pending product approvals, Pending payouts,
Open disputes, Active deliveries, Average delivery time.

Charts: Sales, Orders, New customers, Seller growth, Delivery performance.

## 64. Seller Dashboard

Show: Today's sales, Total sales, Orders, Pending orders, Products, Low-stock
products, Available balance, Pending balance, Rating, Cancellation rate,
Fulfillment rate.

Seller navigation: Dashboard, Orders, Products, Inventory, Store, Customers,
Reviews, Earnings, Payouts, Analytics, Settings.

## 65. Customer Navigation

Home, Categories, Search, Cart, Orders, Wishlist, Notifications, Account.

## 66. Customer Account Navigation

Profile, Addresses, Orders, Wishlist, Reviews, Notifications, Payment Methods,
Security, Help & Support, Logout.

## 67. Database Architecture

Major entities:

```
USER
CUSTOMER_PROFILE
SELLER_PROFILE
RIDER_PROFILE
ADMIN_PROFILE

STORE

REGION
DISTRICT
CITY
AREA
DELIVERY_ZONE

CATEGORY
BRAND
PRODUCT
PRODUCT_VARIANT
INVENTORY
INVENTORY_TRANSACTION

CART
CART_ITEM

ORDER
SELLER_ORDER
ORDER_ITEM

PAYMENT
TRANSACTION
REFUND

WALLET
WALLET_TRANSACTION
PAYOUT

DELIVERY
DELIVERY_ITEM
RIDER_ASSIGNMENT

ADDRESS

REVIEW
REVIEW_REPORT

COUPON
PROMOTION

NOTIFICATION

DISPUTE
DISPUTE_MESSAGE
DISPUTE_EVIDENCE

AUDIT_LOG
```

> Note: this version adds `INVENTORY_TRANSACTION`, `REVIEW_REPORT`,
> `DISPUTE_MESSAGE`, and `DISPUTE_EVIDENCE` compared to the earlier architecture
> pass — worth carrying into the MongoDB schema/models.

## 68. Important Relationships

```
USER → Customer Profile
USER → Seller Profile
USER → Rider Profile

SELLER → STORE
STORE → PRODUCTS
PRODUCT → VARIANTS
PRODUCT → INVENTORY

CUSTOMER → CART
CART → CART ITEMS

CUSTOMER → ORDER
ORDER → SELLER ORDERS
SELLER ORDER → ORDER ITEMS
SELLER ORDER → DELIVERY

ORDER → PAYMENT

SELLER → WALLET
WALLET → WALLET TRANSACTIONS
SELLER → PAYOUTS

CUSTOMER → ADDRESSES
CUSTOMER → REVIEWS
```

## 69. Technical Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js server/API layer initially, TypeScript, domain-based service
  architecture
- **Database:** MongoDB (MongoDB Atlas / Replica Set for multi-document ACID transactions)
- **ODM / ORM:** Mongoose or Prisma (MongoDB provider)
- **Caching:** Redis
- **File storage:** S3-compatible object storage or Cloudinary
- **Authentication:** Clerk/Auth.js/custom secure authentication depending on final
  requirements
- **Payments:** Ghana-compatible payment gateway (Paystack, Hubtel, Flutterwave)
- **Maps:** Google Maps or Mapbox
- **Notifications:** Push notifications, Email, SMS
- **Background jobs:** Queue/job processing system (BullMQ / Redis)
- **Deployment:** Vercel or equivalent frontend hosting, MongoDB Atlas,
  managed Redis, object storage

## 70. Why MongoDB and How It Is Designed

MongoDB is selected for NMarket's hyper-local marketplace due to:
1. **Native Geospatial Indexing (`2dsphere`)**: Built-in GeoJSON indexing supports `$near` and `$geoWithin` queries for rapid distance-based ranking and delivery zone polygon validation without external GIS dependencies.
2. **Atomic Inventory Reservation**: Conditional `$inc` operations prevent overselling natively without table-wide locks.
3. **Flexible Product Catalogs**: Supports polymorphic product attributes and variants across diverse retail categories without complex EAV schemas.
4. **Multi-Document ACID Transactions**: For multi-collection operations (such as checking out parent/seller orders or processing wallet payouts), MongoDB multi-document transactions ensure full atomicity across replica sets.

## 71. Application Architecture

Organize code by business domain rather than by random pages:

```
apps/
  customer
  seller
  admin
  rider

packages/
  ui
  database
  auth
  payments
  marketplace
  orders
  inventory
  delivery
  notifications
  locations
  finance
```

For the MVP, these can initially live inside one Next.js application with separate
role-based route groups. The architecture should still keep the domains separated
internally.

## 72. Domain Architecture

Major domains: IDENTITY, LOCATION, MARKETPLACE, SELLERS, STORES, PRODUCTS,
INVENTORY, CART, ORDERS, PAYMENTS, FINANCE, DELIVERY, RIDERS, REVIEWS, DISPUTES,
NOTIFICATIONS, PROMOTIONS, ANALYTICS, ADMINISTRATION.

Each domain should have: Models, Services, Validation, Business rules, API
handlers, Events.

## 73. Event-Driven Operations

Important business events should be generated by the backend, e.g.:
`ORDER_CREATED`, `PAYMENT_CONFIRMED`, `SELLER_ORDER_CREATED`,
`SELLER_ACCEPTED_ORDER`, `ORDER_READY`, `DELIVERY_CREATED`, `RIDER_ASSIGNED`,
`ORDER_PICKED_UP`, `ORDER_DELIVERED`, `PAYOUT_COMPLETED`.

These events can trigger: Notifications, Inventory updates, Wallet updates,
Analytics, Delivery updates. This makes the system easier to scale.

## 74. Background Jobs

Use background processing for: Notifications, Emails, SMS, Payment reconciliation,
Search indexing, Analytics aggregation, Seller settlement, Payout processing,
Inventory alerts. Do not make customers wait for unnecessary background operations.

## 75. Security

The system must include: Secure authentication, Role-based access control,
Server-side authorization, Input validation, API rate limiting, Secure password
handling where applicable, Payment verification, Webhook verification, CSRF
protection where relevant, Secure file uploads, Image validation, Audit logs,
Session management, Account lockout/risk controls.

**Never trust client-submitted:** Price, Seller ID, Commission, Stock, Payment
status, Order ownership, Permissions. These must be validated server-side.

## 76. Payment Security

Payment provider webhooks must be verified:

1. Receive webhook
2. Verify signature/authenticity
3. Locate transaction
4. Confirm amount
5. Confirm currency
6. Confirm reference
7. Check transaction isn't already processed
8. Update transaction
9. Update order
10. Trigger downstream events

Use idempotency so duplicate webhook calls do not create duplicate orders or
financial entries.

## 77. Order Idempotency

If a customer clicks "Pay" twice or their network reconnects after a timeout, the
system must not create duplicate orders. Use: Checkout session IDs, Idempotency
keys, Payment references, Unique database constraints.

## 78. Inventory Safety

Inventory operations must use database transactions or atomic operations. Example:
stock = 1, Customer A and Customer B both attempt purchase — only one transaction
should successfully reserve the final stock. Never rely only on frontend stock
numbers.

## 79. Audit Logging

Record important actions: Seller approval, Seller rejection, Seller suspension,
Product approval, Product rejection, Commission changes, Refunds, Payout approvals,
Delivery status overrides, Customer suspension, Admin permission changes.

Each log should contain: Actor, Action, Entity, Entity ID, Previous value if
applicable, New value if applicable, Timestamp, IP/device information where
appropriate.

## 80. Analytics

**Marketplace:** GMV, Orders, Average order value, Active customers, Active
sellers, Products, Conversion rate.

**Seller:** Sales, Orders, Fulfillment, Cancellation, Rating, Revenue.

**Delivery:** Average delivery time, Median delivery time, Pickup time, Failed
delivery percentage, Same-day delivery percentage.

**Customer:** Repeat purchase rate, Average order value, Customer retention, Cart
abandonment.

## 81. North Star Metric

**AVERAGE / MEDIAN ORDER-TO-DOOR DELIVERY TIME.** The platform exists primarily to
improve fulfillment speed. Track: Order placed → Seller accepts, Seller accepts →
Ready, Ready → Rider pickup, Pickup → Customer, Total order → customer delivery.
This allows the business to identify bottlenecks.

## 82. Business Model

Potential revenue sources:

- **Seller commission** — percentage of successful sales
- **Delivery margin** — customer pays delivery fee; platform may retain a margin
  after rider/courier cost
- **Seller promotion** — sellers can eventually pay to promote products
- **Sponsored listings** — sellers pay for premium placement
- **Seller subscriptions** — potential future premium seller plans

Do not implement all monetization models initially. **Start with commission +
delivery economics.**

## 83. Local Delivery Economics

```
Customer delivery fee
+
Actual delivery cost
=
Platform delivery margin
```

Example: Customer pays ₵25, rider cost ₵20, platform margin ₵5. The admin should be
able to analyze whether delivery operations are profitable.

## 84. Seller Economics

```
Product subtotal
- Discount
= Net sale

Net sale
- Marketplace commission
- Applicable fees
= Seller earning
```

Seller earning enters pending balance. After settlement: `Pending → Available`.

## 85. Customer Checkout

Checkout should show complete transparency:

```
Seller A:  Products ₵300, Delivery ₵20
Seller B:  Products ₵200, Delivery ₵25
Discount: -₵30
TOTAL:     ₵515
```

Customer must understand exactly what they are paying.

## 86. Customer Order Tracking

The order details screen should show: Order number, Order total, Payment status,
Seller information, Products, Delivery address, Delivery fee, Estimated arrival,
Current status, Tracking timeline, Support, Cancel/return options where applicable.

## 87. Seller Order Management

Seller receives "NEW ORDER" and sees: Customer order items, Quantities, Variants,
Customer delivery area, Preparation deadline, Delivery type, Relevant instructions.

Seller actions: `ACCEPT` / `REJECT`. After accepting → `PREPARING` → `READY FOR
PICKUP`.

## 88. Seller Cancellation

Seller should not be able to casually cancel orders. Track cancellation reasons,
e.g.: Out of stock, Product damaged, Store closed, Incorrect listing, Other.
Repeated cancellations negatively affect seller performance.

## 89. Customer Cancellation

Customer cancellation rules should depend on order stage:

- Before seller accepts → cancellation allowed
- After seller begins preparation → may require restrictions
- After pickup → cancellation becomes a return/refund process

Business rules must be configurable.

## 90. Product Moderation

Admin should be able to: Approve, Reject, Suspend, Edit, Request changes. Reasons
should be recorded, e.g.: Wrong category, Misleading description, Prohibited
product, Poor image, Incorrect price, Duplicate product.

## 91. Seller Quality Control

The platform should automatically flag sellers when: Cancellation rate becomes
high, Complaint rate increases, Ratings decline, Delivery failures increase,
Disputes increase.

Admin can receive: *"Seller performance warning."* Eventually automatic suspension
thresholds can be introduced.

## 92. Customer Trust Features

Display: ✓ Verified Seller · ⭐ Seller Rating · ⚡ Fast Fulfillment · 🚚 Same-Day
Delivery · 📍 2.4 km away. These are powerful because they communicate why the
marketplace is different.

## 93. Expansion Architecture

The system must never assume: One region, One city, One delivery provider, One
payment provider, One rider network, One commission rate. Everything must be
configurable.

Example: Region A → Delivery provider X. Region B → Delivery provider Y. Region C →
Platform riders. This makes nationwide expansion possible.

## 94. Third-Party Integrations

Design integrations behind service interfaces, e.g.: `PaymentService`,
`MapsService`, `NotificationService`, `DeliveryProvider`, `StorageService`.

This allows Payment Provider A → replaced by Payment Provider B without rewriting
checkout. Similarly, Delivery Partner A → Delivery Partner B without rewriting the
entire delivery domain.

## 95. MVP Phase 1

Build: Authentication, Customer accounts, Seller registration, Seller verification,
Admin authentication, Location system, Regions/cities/areas, Stores, Categories,
Products, Product moderation, Inventory.

## 96. MVP Phase 2

Build: Search, Product discovery, Nearby sellers, Cart, Multi-seller cart,
Checkout, Addresses, Delivery fee calculation, Payment, Parent orders, Seller
orders.

## 97. MVP Phase 3

Build: Seller order management, Delivery creation, Delivery zones, Local
riders/partners, Delivery status, Customer order tracking, Notifications, Seller
earnings.

## 98. MVP Phase 4

Build: Seller wallet, Payouts, Refunds, Reviews, Disputes, Seller ratings, Admin
analytics, Seller analytics.

## 99. Phase 5 — Growth

Add: Wishlist, Coupons, Promotions, Featured stores, Sponsored products, Seller
badges, Product recommendations, Price-drop notifications, Back-in-stock alerts.

## 100. Phase 6 — Logistics

Build the full rider ecosystem: Rider registration, Rider verification, Rider app,
Online/offline, Delivery assignment, GPS, Navigation, OTP, Delivery proof, Rider
earnings, Rider analytics, Route optimization.

## 101. Phase 7 — Regional Expansion

Expand from Tamale into: Other Northern communities, Upper East, Upper West, Other
Ghanaian regions. Activate regions through the admin panel rather than code
changes.

## 102. Phase 8 — Nationwide Marketplace

Eventually support: Nationwide sellers, Nationwide customers, Nationwide logistics,
Multiple delivery partners, Regional warehouses, Multiple fulfillment centers,
Advanced delivery optimization, Seller advertising, Large-scale analytics.

## 103. What Must Not Be Hard-Coded

Never hard-code: Regions, Cities, Delivery zones, Delivery fees, Commission rates,
Payment providers, Delivery providers, Seller limits, Product limits, Order limits,
Settlement period, Cancellation rules. These should be configuration data.

## 104. Core Business Flow

```
CUSTOMER
↓
Location detected
↓
Marketplace identifies nearby sellers
↓
Customer searches/browses
↓
Customer selects product
↓
Customer sees seller + distance + delivery estimate
↓
Customer adds to cart
↓
Checkout calculates delivery
↓
Customer pays
↓
Payment verified
↓
Parent order created
↓
Seller orders created
↓
Inventory reserved
↓
Seller receives order
↓
Seller accepts
↓
Seller prepares
↓
Seller marks ready
↓
Delivery created
↓
Rider/partner assigned
↓
Rider picks up
↓
Rider delivers
↓
Customer confirms using OTP
↓
Order delivered
↓
Settlement begins
↓
Seller funds become available
↓
Customer reviews
↓
Analytics updated
```

This is the central business engine.

## 105. Core Architectural Principle

The system should be built around independent but connected domains:

| Domain | Answers |
|---|---|
| IDENTITY | Who is using the platform |
| LOCATION | Where everyone is |
| MARKETPLACE | What is being sold |
| SELLERS | Who is selling |
| INVENTORY | What is available |
| CART | What customer wants |
| ORDERS | What customer purchased |
| PAYMENTS | How it was paid |
| FULFILLMENT | How seller prepares it |
| DELIVERY | How it physically moves |
| FINANCE | How money is distributed |
| TRUST | Whether the marketplace remains safe |
| NOTIFICATIONS | How everyone stays informed |
| ANALYTICS | How the business learns |
| ADMINISTRATION | How the platform is controlled |

## 106. Final Platform Vision

The long-term platform should become the digital infrastructure for local commerce
in Ghana.

A customer in Tamale should be able to search "Rice" and immediately see: Local
sellers, Nearby stores, Prices, Ratings, Available stock, Delivery times.

A seller in Tamale should be able to register, become verified, create a store,
upload products and start receiving online orders without needing to build their
own website.

A customer should be able to purchase from multiple local businesses through one
marketplace. A rider should be able to receive and fulfill delivery requests. The
platform owner should be able to control, monitor and grow the entire ecosystem
from one administrative system.

The ultimate ecosystem:

```
CUSTOMERS
↕
MARKETPLACE
↕
LOCAL SELLERS
↕
LOCAL STORES
↕
LOCAL INVENTORY
↕
LOCAL DELIVERY
↕
RIDERS
↕
CUSTOMERS
```

with PAYMENTS, FINANCE, TRUST, NOTIFICATIONS, ANALYTICS, and ADMINISTRATION
supporting the entire system.

## 107. The First Principle for Development

Do not begin by building random screens. First establish:

1. Business rules
2. User roles
3. Database schema
4. Location architecture
5. Seller architecture
6. Product architecture
7. Inventory rules
8. Cart architecture
9. Parent/seller order architecture
10. Payment architecture
11. Delivery architecture
12. Wallet/settlement architecture
13. Notification events
14. Permission system
15. Admin controls

Then build the interfaces on top of these systems. **The UI should be a
representation of the underlying business logic, not the other way around.**

## 108. Project Success Criteria

The first version should be considered successful when the following complete
transaction works reliably, for a customer in Tamale:

1. Opens the marketplace.
2. Allows GPS or enters a location.
3. Sees nearby products.
4. Finds a verified seller.
5. Adds a product to cart.
6. Checks out.
7. Sees the correct delivery fee.
8. Pays successfully.
9. Receives an order confirmation.
10. Seller receives the order.
11. Seller accepts it.
12. Seller prepares it.
13. Order becomes ready.
14. Delivery is assigned.
15. Rider picks it up.
16. Customer tracks the delivery.
17. Rider delivers.
18. Customer confirms delivery.
19. Seller's funds enter settlement.
20. Customer reviews the order.
21. Admin can see the entire transaction.

If this works reliably, the foundation of the marketplace is working. Everything
else can be layered on top.

## 109. The Core Database Relationship

The most important relationship in the entire system:

```
USER → SELLER → STORE → PRODUCT → INVENTORY

USER → CUSTOMER → CART → ORDER → SELLER ORDER → ORDER ITEM → DELIVERY

ORDER → PAYMENT

SELLER → WALLET → PAYOUT

DELIVERY → RIDER

ORDER → REVIEW → DISPUTE → REFUND
```

This relationship should guide the database design, API design and frontend
architecture.

## 110. Final Product Definition

This project is a **location-aware, multi-vendor Ghanaian e-commerce marketplace
and local delivery platform.**

It is initially designed for Tamale and Northern Ghana but architected for
nationwide expansion. Its primary objective is to digitize local businesses and
significantly reduce the delivery time customers experience by prioritizing nearby
sellers and enabling efficient local fulfillment.

The platform consists of: **Customer Marketplace + Seller Store Management + Super
Admin Marketplace Management + Delivery/Rider Infrastructure + Payment & Financial
Settlement + Location/GPS Infrastructure + Trust & Safety + Analytics.**

**Core business loop:** `DISCOVER → BUY → PAY → FULFILL → DELIVER → COMPLETE →
SETTLE → REVIEW`

**Core competitive advantage:** `LOCAL INVENTORY + LOCAL SELLERS + FAST DELIVERY +
TRUST`

**Initial strategy:** Start dense in Tamale → prove fast local commerce → expand
across Northern Ghana → expand nationwide.

The technical architecture must therefore be modular, location-aware,
transaction-safe, configurable, secure and scalable from the beginning.
