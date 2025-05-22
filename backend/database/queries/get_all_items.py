from backend.database.supabase_client import supabase


def get_all_items():
    query = supabase.table("items").select("*").execute()
    return query.data
