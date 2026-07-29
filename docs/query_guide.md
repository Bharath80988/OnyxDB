# OnyxDB — Comprehensive Query Guide & Syntax Reference

This document serves as the authoritative developer reference manual for querying **OnyxDB** via JSON over HTTP REST payload requests.

---

## 🔑 1. Prerequisites & Authentication

All queries are executed via `POST` requests to the REST endpoint:
```http
POST http://localhost:8080/api/query
Content-Type: application/json
Authorization: Bearer <token>
```

### Role-Based Access Control (RBAC) Tokens

| Role | Token Header | Permitted Actions |
| :--- | :--- | :--- |
| **`ADMIN`** | `Authorization: Bearer admin-secret-key` | `insert`, `update`, `delete`, `select`, `create_index`, `create_foreign_key`, `vector_search` |
| **`READ_ONLY`** | `Authorization: Bearer readonly-secret-key` | `select`, `vector_search` |

---

## 📋 2. Complete Query Actions & Payload Formats

### A. Create Foreign Key Relational Constraint (`create_foreign_key`)
Establishes cross-table relational links between a child table field and a parent table primary key/field.

#### Payload Syntax:
```json
{
  "action": "create_foreign_key",
  "table": "orders",
  "field": "user_id",
  "parent_table": "users",
  "parent_field": "id",
  "on_delete": "RESTRICT"
}
```

#### Parameters:
- **`table`** *(string, required)*: The child table receiving the foreign key constraint (`orders`).
- **`field`** / **`child_field`** *(string, required)*: The field in the child table referencing the parent (`user_id`).
- **`parent_table`** / **`referenced_table`** *(string, required)*: The target parent table (`users`).
- **`parent_field`** / **`referenced_field`** *(string, optional, default: `"id"`)*: The referenced column in the parent table.
- **`on_delete`** *(string, optional, default: `"RESTRICT"`)*:
  - **`"RESTRICT"`**: Rejects deletion of parent records if matching child records exist.
  - **`"CASCADE"`**: Automatically deletes matching child records when parent record is deleted.

---

### B. Insert Record (`insert`)
Inserts a new record payload into the specified table B+ Tree. Dynamically creates `<table_name>.db` if the table does not exist.

#### Payload Syntax:
```json
{
  "action": "insert",
  "table": "orders",
  "data": {
    "id": 101,
    "user_id": 1,
    "product": "Cyberpunk Workstation",
    "amount": 2499.99,
    "status": "COMPLETED",
    "vector": [0.12, 0.85, 0.43, -0.21]
  }
}
```

> [!IMPORTANT]
> If foreign key constraints are registered on `orders.user_id`, OnyxDB automatically validates that record `id: 1` exists in the parent table `users`. If missing, an `IllegalStateException` Foreign Key Violation is thrown.

---

### C. Update Record (`update`)
Modifies an existing record in place inside the B+ Tree leaf page in $O(\log N)$ time.

#### Payload Syntax:
```json
{
  "action": "update",
  "table": "orders",
  "data": {
    "id": 101,
    "user_id": 1,
    "product": "Cyberpunk Workstation Pro",
    "amount": 2799.99,
    "status": "SHIPPED"
  }
}
```

---

### D. Delete Record (`delete`)
Removes a record from B+ Tree leaf pages with memory slot-shifting.

#### Payload Syntax:
```json
{
  "action": "delete",
  "table": "users",
  "id": 1
}
```

> [!WARNING]
> If table `users` has child foreign key constraints:
> - Under **`RESTRICT`**: Deletion fails if any record in `orders` has `user_id: 1`.
> - Under **`CASCADE`**: All child records in `orders` with `user_id: 1` are automatically deleted.

---

### E. Point Select by Primary Key (`select` by `id`)
Executes an $O(\log N)$ binary search point lookup over leaf pages.

#### Payload Syntax:
```json
{
  "action": "select",
  "table": "users",
  "id": 1
}
```

---

### F. Create Secondary Index (`create_index`)
Builds a secondary B+ Tree index on non-primary key fields (`email`, `status`, `role`).

#### Payload Syntax:
```json
{
  "action": "create_index",
  "table": "orders",
  "field": "status"
}
```

---

### G. Select by Secondary Index ($O(\log N)$ Index Scan)
Executes a fast index lookup on a indexed field, bypassing full table scans.

#### Payload Syntax:
```json
{
  "action": "select",
  "table": "orders",
  "where": {
    "status": "SHIPPED"
  }
}
```

---

### H. Filtered Table Scan (`select` with `where`)
Evaluates matching conditions against unindexed fields across all records.

#### Payload Syntax:
```json
{
  "action": "select",
  "table": "orders",
  "where": {
    "status": "COMPLETED",
    "user_id": "1"
  }
}
```

---

### I. AI Vector Search (`vector_search`)
Performs exact K-Nearest Neighbor (KNN) Cosine Similarity search over high-dimensional vector arrays.

#### Payload Syntax:
```json
{
  "action": "vector_search",
  "table": "products",
  "vector": [0.12, 0.85, 0.43, -0.21],
  "k": 5
}
```

---

## 🛠️ 3. Full Example Workflow: Relational E-Commerce Schema

Here is a complete step-by-step example showing how to set up relational tables, indexes, and queries in OnyxDB:

### Step 1: Insert Parent User
```json
{
  "action": "insert",
  "table": "users",
  "data": { "id": 1, "name": "Alice", "email": "alice@onyx.db", "role": "VIP" }
}
```

### Step 2: Establish Foreign Key Constraint with CASCADE
```json
{
  "action": "create_foreign_key",
  "table": "orders",
  "field": "user_id",
  "parent_table": "users",
  "parent_field": "id",
  "on_delete": "CASCADE"
}
```

### Step 3: Insert Valid Child Order
```json
{
  "action": "insert",
  "table": "orders",
  "data": { "id": 5001, "user_id": 1, "total": 149.50 }
}
```

### Step 4: Delete Parent User (Cascades to Child Order)
```json
{
  "action": "delete",
  "table": "users",
  "id": 1
}
```
*Result: User `1` and Order `5001` are both safely deleted.*
