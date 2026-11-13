# AppForge Security Specification & Red-Team Audit

## 1. Data Invariants
1. **Default Deny Safety Net**: All unspecified paths under `/databases/{database}/documents` reject both reads and writes unconditionally.
2. **Verified Identity Mandate**: Standard user mutations require `request.auth != null && request.auth.token.email_verified == true`.
3. **Path Variable ID Poisoning Guard**: Every single-document operation (`get`, `create`, `update`, `delete`) enforces `isValidId(docId)` (`^[a-zA-Z0-9_\\-]+$` and `<= 128` chars).
4. **PII Split-Collection Isolation**: User email addresses and Vercel connection status live exclusively under `/users/{userId}/private/{docId}`, readable and writable ONLY when `request.auth.uid == userId`. Raw OAuth/PAT tokens are NEVER persisted in Firestore; they remain encrypted server-side via AES-256-GCM.
5. **Immutable Ownership & Temporal Integrity**:
   - `createdAt == request.time` and `updatedAt == request.time` on document creation.
   - `ownerId == request.auth.uid` on creation and immutable (`incoming().ownerId == existing().ownerId`, `incoming().createdAt == existing().createdAt`) on update.
6. **Master Gate Relational Integrity**:
   - `UploadedMediaAsset` (`/assets/{assetId}`) and `VercelDeploymentRecord` (`/deployments/{deployId}`) cannot be orphaned: `create` verifies via `exists(...)` and `get(...).data.ownerId == request.auth.uid` that the referenced `/projects/{projectId}` exists and belongs to the caller.
7. **Terminal State Locking**:
   - Once a `VercelDeploymentRecord` enters `'READY'`, `'ERROR'`, or `'CANCELED'`, deployment state transitions are locked (`existing().state in ['QUEUED', 'BUILDING']`) except updating an optional `customDomain` binding cleanly.
8. **Secure List Queries**:
   - Every `allow list` rule evaluates `resource.data.ownerId == request.auth.uid` (no blanket `isSignedIn()` list queries and zero `get()`/`exists()` inside `allow list`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Category | Target Path | Malicious Payload / Context | Expected Outcome |
|---|----------------|-------------|----------------------------|------------------|
| 1 | Unauthenticated Read/Write | `/projects/proj_1` | `auth: null`, create/get project | `PERMISSION_DENIED` |
| 2 | Unverified Email Spoof | `/projects/proj_1` | `auth: { uid: 'u1', token: { email_verified: false } }` | `PERMISSION_DENIED` |
| 3 | Identity Spoofing (`ownerId`) | `/projects/proj_1` | `auth.uid == 'u1'`, payload `{ ownerId: 'victim_uid', ... }` | `PERMISSION_DENIED` |
| 4 | Cross-User PII Leak | `/users/victim/private/info` | `auth.uid == 'attacker'` attempting `get` | `PERMISSION_DENIED` |
| 5 | Shadow / Ghost Field Injection | `/projects/proj_1` | Valid keys + `{ isVerified: true, role: 'admin' }` | `PERMISSION_DENIED` |
| 6 | ID Poisoning (>128 chars / invalid chars) | `/projects/../../../etc/passwd` or 300-char ID | Invalid document ID | `PERMISSION_DENIED` |
| 7 | Client Timestamp Spoofing | `/projects/proj_1` | `{ createdAt: '1999-01-01T00:00:00Z' }` instead of `request.time` | `PERMISSION_DENIED` |
| 8 | Immutable Field Tampering | `/projects/proj_1` (update) | Owner modifies `ownerId` or `createdAt` | `PERMISSION_DENIED` |
| 9 | Value / Size Poisoning (Denial of Wallet) | `/projects/proj_1` | `{ name: 'A'.repeat(2000) }` exceeding maxLength 140 | `PERMISSION_DENIED` |
| 10 | Orphaned Asset / Deployment | `/assets/asset_1` | Valid auth, `projectId: 'non_existent_or_not_owned'` | `PERMISSION_DENIED` |
| 11 | Terminal State Mutation | `/deployments/dep_1` (update) | `existing().state == 'READY'`, attempt change `state -> 'BUILDING'` | `PERMISSION_DENIED` |
| 12 | Unscoped List Query Scraping | `/projects` (list) | `allow list` queried without `where('ownerId', '==', uid)` | `PERMISSION_DENIED` |

---

## 3. Red Team Conflict Report
- **`/users/{userId}/public/{docId}`**:
  - Identity Spoofing: Blocked (`userId == request.auth.uid && incoming().uid == request.auth.uid`).
  - Shadow Fields: Blocked (`hasAll` + `hasOnly` on create, `affectedKeys().hasOnly(...)` on update).
  - Resource Poisoning: Blocked (`displayName.size() <= 100`, `photoUrl.size() <= 512`).
- **`/users/{userId}/private/{docId}`**:
  - PII Blanket Test: Blocked (`get` and `write` strictly require `request.auth.uid == userId`; `allow list: if false;`).
  - Email Spoofing: Blocked (`request.auth.token.email_verified == true` required).
- **`/projects/{projectId}`**:
  - Identity Spoofing: Blocked (`incoming().ownerId == request.auth.uid`; immutable on update).
  - Value Poisoning: Blocked (`isValidProject` checks type + length on every string and key count on `projectData`).
  - Query Trust: Blocked (`allow list: if isSignedIn() && resource.data.ownerId == request.auth.uid`).
- **`/assets/{assetId}`**:
  - Orphaned Write: Blocked (`exists(/projects/$(incoming().projectId))` and `get(...).ownerId == request.auth.uid`).
  - Mime Poisoning: Blocked (`mimeType in ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']` and `sizeBytes <= 2097152`).
- **`/deployments/{deployId}`**:
  - State Shortcutting & Terminal Mutation: Blocked (`existing().state in ['QUEUED', 'BUILDING']` enforced before status update; `'READY'`/`'ERROR'`/`'CANCELED'` states locked).
  - Parent Ownership: Verified on create via `get(/projects/$(incoming().projectId)).data.ownerId == request.auth.uid`.
