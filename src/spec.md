# Specification

## Summary
**Goal:** Make the Motoko backend compile in production by removing all `mo:core/*` usage and rewriting `backend/main.mo` to use only `mo:base/*` modules (and built-ins), while keeping the existing public Candid API and behavior intact.

**Planned changes:**
- Rewrite `backend/main.mo` to eliminate all imports from `mo:core/*` and replace them with `mo:base/*` equivalents.
- Replace any `mo:core`-specific data structures/APIs in `backend/main.mo` with `mo:base` alternatives, preserving the existing public methods, parameters/return types, and behavior for profiles, shop items CRUD, cart, UPI purchases, orders listing, approval, and config endpoints.
- Ensure upgrade-safe state by implementing stable state serialization and reconstruction within the single `backend/main.mo` actor (creating `backend/migration.mo` only if required to preserve already-deployed state), with sensible defaults on fresh install.
- Ensure all trap/error paths remain English and use production-safe trapping (no reliance on `mo:core` runtime APIs).

**User-visible outcome:** The canister builds successfully for production without `mo:core` import failures, and all existing backend APIs continue to work the same for user profiles, shop/cart flows, UPI purchasing, order management, and configuration, including across upgrades.
