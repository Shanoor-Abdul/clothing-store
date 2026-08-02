# 🛒 Clothing Store E-Commerce Platform

A high-performance, full-stack apparel e-commerce web application built with **Next.js 16 (App Router)**, **Prisma ORM**, **PostgreSQL (Supabase)**, **Redux Toolkit**, **TanStack React Query**, and **JWT Authentication**.

---

## 📚 E-Commerce Admin Architecture & Storefront Management Guide

This section explains how to structure Categories, Subcategories, Collections, Banners, Product Flags, and Publishing Statuses in the Admin Panel to create a world-class shopping experience.

---

### 1. 🏗️ Category vs. Subcategory vs. Collection

Understanding the difference between **Categories** and **Collections** is key to managing a modern clothing store:

| Feature | **Category (Parent Department)** | **Subcategory** | **Collection (Seasonal / Event Campaign)** |
| :--- | :--- | :--- | :--- |
| **Definition** | Permanent, structural department based on who wears it. | Specific clothing type under a department. | Event-based, seasonal, or thematic promotional grouping. |
| **Examples** | `Men`, `Women`, `Kids`, `Accessories` | `Dresses`, `Lehengas`, `Shirts`, `Trousers` | `Wedding Collection 2026`, `Summer Stylish Apparel`, `Eid Festive Wear` |
| **Product Limit** | A product belongs to **1 Parent Category**. | A product belongs to **1 Subcategory**. | A product can belong to **Multiple Collections** simultaneously! |
| **Purpose** | Store navigation bar & structural filtering. | Sub-navigation filtering. | Promotional campaigns, landing page carousels, and seasonal sales. |

---

### 🌳 Real-World Apparel Hierarchy Tree

```
├── DEPARTMENTS (Categories)
│   ├── MEN
│   │   ├── Shirts (Subcategory)
│   │   ├── Trousers (Subcategory)
│   │   └── Suits & Ethnic (Subcategory)
│   ├── WOMEN
│   │   ├── Dresses (Subcategory)
│   │   ├── Lehengas (Subcategory)
│   │   └── Tops & Blouses (Subcategory)
│   └── KIDS
│       ├── Boys Party Wear (Subcategory)
│       └── Girls Festive Dresses (Subcategory)
│
└── CAMPAIGN COLLECTIONS (Cross-Departmental Tags)
    ├── 💍 "Wedding Season 2026"
    │   ├── Includes: Women Silk Lehenga (Category: Women)
    │   ├── Includes: Men Velvet Sherwani (Category: Men)
    │   └── Includes: Kids Royal Suit (Category: Kids)
    ├── ☀️ "Summer Stylish Collection"
    │   ├── Includes: Men Linen Shirt (Category: Men)
    │   └── Includes: Women Cotton Sundress (Category: Women)
    └── ⚡ "Festive Deals"
```

---

### 2. 🏷️ Assigning Collections to Products

In the Admin **Product Creation / Edit Form**, under **"Assign Collections"**, you can select multiple collections for a single item:

#### **Example Scenario:**
Suppose you add a **"Royal Silk Kurta"**:
- **Category**: `Men`
- **Subcategory**: `Suits & Ethnic`
- **Assigned Collections**: `[ "Wedding Season 2026", "Festive Deals" ]`

#### **What happens on the Storefront?**
1. When a customer navigates to **`Men -> Suits & Ethnic`**, the product appears under Men's Ethnic Wear.
2. When a customer clicks on the **"Wedding Season 2026"** banner on the Homepage, this Kurta appears alongside Women's Lehengas and Kids Suits.
3. When filtering by `collection=wedding-season-2026` on `/products`, it is automatically listed!

---

### 3. 🚩 Product Display Preferences & Visibility Flags

When creating or editing a product, you have 3 checkboxes and 1 publishing dropdown:

#### **A. Checkbox Flags**
- **`isActive` (Active / Hidden)**:
  - **Checked (`true`)**: Product is active and searchable.
  - **Unchecked (`false`)**: Completely hides the product from the storefront.
- **`isFeatured` (Featured Showcase)**:
  - **Checked (`true`)**: Displays the product in the Homepage **"Featured Drops & New Arrivals"** carousel.
  - **Unchecked (`false`)**: Product appears only inside catalog search and category pages.
- **`isReturnable` (24-Hour Return Window)**:
  - **Checked (`true`)**: Displays a green `✓ 24-Hour Return Window` badge on the product details page and enables the **Return Order** button under `My Orders` after delivery.
  - **Unchecked (`false`)**: Displays `Final Sale - Non Returnable`.

#### **B. Publishing Status (`status`)**

| Status | Storefront Behavior | Admin Use Case |
| :--- | :--- | :--- |
| **`PUBLISHED`** | Live in store. Searchable, purchasable, and visible to all customers. | Fully ready products. |
| **`DRAFT`** | Hidden from store. Only visible to Admin inside Admin Dashboard. | Drafts under preparation or awaiting images. |
| **`OUT_OF_STOCK`** | Visible in store, but **Add to Cart** and **Buy Now** buttons are disabled with an "Out of Stock" badge. | Items temporarily out of inventory. |
| **`ARCHIVED`** | Hidden from store listings. Retained in historical database records for analytics. | Discontinued seasonal stock. |

---

### 4. 🖼️ Hero Banner Setup & Configuration

Hero Banners drive homepage traffic to specific collections or sales:

- **`imageUrl`**: High-resolution wide banner image or video URL.
- **`displayOrder`**: Integer number (e.g. `1`, `2`, `3`) that determines the slide order in the homepage banner carousel. Banner with order `1` shows first.
- **`buttonText`**: Text rendered on the banner call-to-action button (e.g. `"Shop Wedding Collection"`, `"Explore Summer Sale"`).
- **`redirectUrl`**: Destination URL when a customer clicks the banner button.
  - Example: `/products?collection=cms...` (redirects to Wedding Collection)
  - Example: `/products?category=cms...` (redirects to Women's Wear)
  - Example: `/products?featured=true` (redirects to Featured Sale)

---

## 🛠️ Local Development & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?connection_limit=10&pool_timeout=30"
DIRECT_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your_secure_jwt_secret"
```

### 3. Database Migration & Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the store.

---

## 🚢 Production Build & Verification
To build the production bundle:
```bash
npm run build
```
All **57 static pages and API routes** compile cleanly with Next.js Turbopack.
