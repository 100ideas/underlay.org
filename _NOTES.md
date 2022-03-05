# 100ideas dev notes 

https://supabase.com/docs/learn/auth-deep-dive/auth-deep-dive-jwts

https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security



### handle_new_user() trigger needs deps - postgres error on new user

see https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for background

new user creation was failing silently b/c custom trigger (installed by prisma migrate) depends on unaccent extension which is not enabled by default.

"function unaccent(text) does not exist\",,\"No function matches the given name and argument types. You might need to add explicit type casts."
- https://www.postgresql.org/docs/14/unaccent.html
- 

go to https://app.supabase.io/project/qwsqkxvmicyiizgjrxtf/database/extensions

### new user profile pic not getting inserted correctly/at all in supabase storage bucket

- docs https://supabase.com/docs/guides/storage#add-security-rules
- more https://supabase.com/blog/2021/03/30/supabase-storage
- **learn about security policy statements** https://supabase.com/docs/guides/auth/row-level-security

- create `avatars` storage bucket (I think?)
- create new user via form, add photo
- notice request is 500 but also we get a bucket uri for the file

- **DOESNT WORK** to fix: allow public access to avatars storage bucket. run this in supabase console: 

```sql
create policy "Read access for avatars."
on storage.objects for select using (
    bucket_id = 'avatars'
);
```

> To do this, we leverage Postgres' Row Level Security. We create a table for buckets and objects inside each Supabase project. These tables are namespaced in a separate schema called storage.
>
> The idea is simple - if a user is able to select from the objects table, they can retrieve the object too. Using Postgres' Row Level Security, you can define fine-grained Policies to determine access levels for different users.
>
> When a user makes a request for a file, the API detects the user in the Authorization header and tries to select from the objects table. If a valid row is returned, the Storage API pipes the object back from S3. Similarly if the user is able to delete the row from the objects table, they can delete the object from the storage backend too. - https://supabase.com/blog/2021/03/30/supabase-storage#security

**Ah HA!**

> The bucket needs to be set to public, either via updateBucket() or by going to Storage on app.supabase.io, clicking the overflow menu on a bucket and choosing "Make public"

solution: u