# Project Overview

## Architecture
- **Framework**: Next.js 16 (App Router) + React 19
- **State**: Redux Toolkit (auth, cart) + TanStack Query (server state)
- **Database**: Prisma + PostgreSQL
- **Styling**: Tailwind CSS 4
- **Auth**: JWT (access + refresh tokens), httpOnly cookies
- **UI Library**: @shanoorabdul/ui-library + lucide-react icons

## Key Patterns
- Feature-based folder structure under `/features`
- API routes in `/app/api` (Next.js Route Handlers)
- Admin CRUD uses feature-based components (Form, Table, DeleteModal)
- Store front uses `(store)` route group
- Admin uses `/admin` route group

## Current State
- Admin CRUD: Banners, Brands, Categories, Colors - fully built
- Admin: Sizes, Collections, Products (create/edit) - need implementation
- Store: Home, Products, Cart, Checkout, Orders, Wishlist, Profile - built
- Store: Addresses management - missing
- Performance: No pagination, no skeletons, no code splitting