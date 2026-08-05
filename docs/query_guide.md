# OnyxDB — Comprehensive Query Guide and Syntax Reference

This document provides a developer reference manual for querying **OnyxDB** using JSON payloads over HTTP REST and TCP socket connections.

---

## 1. Prerequisites and Authentication

All HTTP queries are sent as `POST` requests to the REST endpoint:
```http
POST http://localhost:8080/api/query
Content-Type: application/json
Authorization: Bearer <token>
```

### Role-Based Access Control (RBAC) Tokens

| Role | Token Header | Allowed Actions |
| :--- | :--- | :--- |
| **`ADMIN`** | `Authorization: Bearer admin-secret-key` | `insert`, `update`, `delete`, `select`, `create_index`, `create_foreign_key`, `vector_search` |
| **`READ_ONLY`** | `Authorization: Bearer readonly-secret-key` | `select`, `vector_search` |

---

## 2. Onyx Query Syntax (OQS)

OnyxDB supports string queries via the `"oqs"` key:

```json
{
  "oqs": "GET users 101"
}
```

### Supported OQS Commands:
- **`GET <table> <id>`**: Point lookup by record primary key (`GET users 101`).
- **`FIND <table> WHERE <field> = <val>`**: Filtered table search (`FIND users WHERE status = ACTIVE`).
- **`INSERT INTO <table> <json>`**: Insert record (`INSERT INTO users {"id": 101, "name": "Satoshi"}`).
- **`UPDATE <table> <id> SET <field> = <val>`**: Update record (`UPDATE users 101 SET status = INACTIVE`).
- **`DELETE <table> <id>`**: Delete record (`DELETE users 101`).
- **`INDEX <table> ON <field>`**: Create secondary B+ Tree index (`INDEX users ON email`).

---

## 3. Structured JSON Query Actions and Formats

### A. Create Foreign Key Constraint (`create_foreign_key`)
Establishes a relational constraint linking a child table field to a parent table field.

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
- **`parent_table`** / **`referenced_table`** *(string, required)*: The referenced parent table (`users`).
- **`parent_field`** / **`referenced_field`** *(string, optional, default: `"id"`)*: The column in the parent table being referenced.
- **`on_delete`** *(string, optional, default: `"RESTRICT"`)*:
  - **`"RESTRICT"`**: Rejects deletion of parent records if matching child records exist.
  - **`"CASCADE"`**: Automatically deletes matching child records when the parent record is deleted.

---

### B. Insert Record (`insert`)
Inserts a new record into the specified table. Automatically creates `<table_name>.db` if the table does not yet exist.

#### Payload Syntax:
```json
{
  "action": "insert",
  "table": "orders",
  "data": {
    "id": 101,
    "user_id": 1,
    "product": "Workstation Computer",
    "amount": 2499.99,
    "status": "COMPLETED",
    "vector": [0.12, 0.85, 0.43, -0.21]
  }
}
```

> If foreign key constraints are defined on `orders.user_id`, OnyxDB verifies that `id: 1` exists in the `users` parent table. If missing, a Foreign Key Constraint Error is thrown.

---

### C. Update Record (`update`)
Modifies an existing record in place inside the B+ Tree page in logarithmic time ($O(\log N)$).

#### Payload Syntax:
```json
{
  "action": "update",
  "table": "orders",
  "data": {
    "id": 101,
    "user_id": 1,
    "product": "Workstation Computer Pro",
    "amount": 2799.99,
    "status": "SHIPPED"
  }
}
```

---

### D. Delete Record (`delete`)
Removes a record from B+ Tree leaf pages.

#### Payload Syntax:
```json
{
  "action": "delete",
  "table": "users",
  "id": 1
}
```

> If table `users` has child foreign key constraints:
> - Under **`RESTRICT`**: Deletion fails if any record in `orders` references `user_id: 1`.
> - Under **`CASCADE`**: All child records in `orders` with `user_id: 1` are automatically deleted.

---

### E. Point Select by Primary Key (`select` by `id`)
Executes a binary search lookup by primary key (`id`) in $O(\log N)$ time.

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
Retrieves records matching an indexed field value without scanning the entire table.

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
Evaluates matching conditions against unindexed fields across table records.

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
Performs exact K-Nearest Neighbor (KNN) Cosine Similarity search over vector arrays.

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

## 3. Example Relational Workflow

Here is a step-by-step example showing how to set up relational tables and execute queries:

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

### Step 3: Insert Child Order
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
*Result: User `1` and Order `5001` are both deleted automatically.*
