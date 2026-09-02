# Marketplace, Catalog & Search

## 12. Marketplace Architecture

The marketplace contains:

- Categories
- Brands
- Stores
- Products
- Collections
- Search
- Filters
- Recommendations

Example:

```
Fashion
├── Men's Fashion
├── Women's Fashion
├── Shoes
└── Accessories

Electronics
├── Phones
├── Laptops
├── TVs
└── Accessories
```

## 13. Product Architecture

A product belongs to a seller/store:

```
Product
├── Seller
├── Store
├── Category
├── Brand
├── Name
├── Description
├── Images
├── Price
├── Compare-at price
├── SKU
├── Inventory
├── Variants
├── Weight
├── Dimensions
├── Status
├── Location
└── Delivery eligibility
```

## 14. Product Status

Use a proper state system:

```
DRAFT
   ↓
PENDING_REVIEW
   ↓
APPROVED
   ↓
PUBLISHED
```

Possible alternatives: `REJECTED`, `SUSPENDED`, `ARCHIVED`, `OUT_OF_STOCK`.

This allows moderation of the marketplace.

## 42. Search Architecture

Search shouldn't only match product names. A search for "Samsung A15" should consider:

- Product name
- Description
- Brand
- Category
- SKU
- Tags
- Seller
- Location
- Availability

And then rank by:

```
Relevance
+
Distance
+
Availability
+
Seller rating
+
Delivery speed
+
Popularity
```

This is where the platform can become genuinely local.

## 43. Local Search Ranking

Suppose two sellers sell the same phone:

**Seller A:** 2 km away, ₵2,500, 4.8 rating, same-day delivery
**Seller B:** 650 km away, ₵2,400, 4.5 rating, 3-day delivery

For a Tamale customer, Seller A may be ranked higher despite costing ₵100 more.

That is precisely what makes this marketplace different.
