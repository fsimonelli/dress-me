from backend.database.supabase_client import supabase

def update_batch(batch):
    response = (
        supabase.table("items")
        .upsert(batch)
        .execute()
    )