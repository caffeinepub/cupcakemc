# Specification

## Summary
**Goal:** Build Phase 1 of the Minecraft shop with core functionality for browsing items, viewing details, and managing a shopping cart.

**Planned changes:**
- Create backend data model for shop items with fields (id, name, description, price, imageUrl, stock, category, isActive) using mo:base types only
- Implement backend CRUD operations (create, update, delete, get, list) with admin authorization
- Build shopping cart backend with per-user storage supporting add, remove, update quantity, get, and clear operations
- Create shop browse page displaying items in a grid with category filtering
- Build item detail view with full information, quantity selector, and add to cart functionality
- Implement shopping cart UI showing items, quantities, prices, and total calculation
- Create admin panel for managing shop items with create, edit, and delete forms

**User-visible outcome:** Users can browse shop items, view detailed information, add items to their cart with quantities, and manage their cart. Admins can create, edit, and delete shop items through a protected admin panel.
