# PayFlow API contract — initial monolith

The frontend is deliberately still mock-data driven. These endpoints are the backend contract it will adopt later; no frontend file has been changed.

All API paths are versioned below `/api/v1`. Amounts are decimal JSON numbers, timestamps are ISO-8601 UTC, and lists with paging return `content`, `page`, `size`, `totalElements`, and `totalPages`.

| UI area | Endpoint | Purpose |
| --- | --- | --- |
| Login/session | `POST /auth/login`, `POST /auth/logout`, `GET /me` | Required when security is added; not implemented yet. |
| Customer accounts | `GET /users/{userId}/accounts`, `GET /accounts/{id}` | Account cards and account details. |
| Beneficiaries | `GET/POST /users/{userId}/beneficiaries`, `DELETE /users/{userId}/beneficiaries/{id}` | List and manage payees. |
| Transfers | `POST /users/{userId}/transfers` | Submit `{fromAccountId, beneficiaryId, amount, description}`. Transfers at or above INR 50,000 are flagged for review. |
| Customer history | `GET /users/{userId}/transactions?page&size`, `GET /transactions/{reference}` | History, detail page, receipt, and export source. |
| Admin/auditor monitoring | `GET /admin/transactions?status&page&size`, `POST /admin/transactions/{reference}/review` | Monitor all payments and approve/reject flagged transfers. |
| Account monitoring | `PATCH /admin/accounts/{id}/status` | Block, reactivate, or close an account. |

## Deliberate next phase

The temporary `{userId}` path is a development seam only. Before exposing the service, replace it with a JWT-authenticated principal; enforce ownership and role checks in Spring Security. The remaining UI-backed contracts to build next are users/admin management, dashboard aggregates, notifications, audit logs, profile/password changes, CSV transaction export, and PDF statements/receipts.

## Core guarantees implemented

- PostgreSQL schema is versioned by Flyway; Hibernate validates it rather than modifying it.
- Transfer processing is transactional and locks the source account while validating balance and status.
- Flagged payments do not move funds until an admin approves them.
