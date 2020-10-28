# Migration `20201028182707-init`

This migration has been generated by Joel Gustafson at 10/28/2020, 2:27:07 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE UNIQUE INDEX "agents.userId_organizationId_unique" ON "public"."agents"("userId", "organizationId")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201028182500-init..20201028182707-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
     provider = "postgresql"
-    url = "***"
+    url = "***"
 }
 model Account {
     id                 String    @id @default(uuid())
@@ -91,8 +91,9 @@
     collections        Collection[]
     schemaVersions     SchemaVersion[]
     collectionVersions CollectionVersion[]
+    @@unique([userId, organizationId])
     @@map(name: "agents")
 }
 model Member {
```

