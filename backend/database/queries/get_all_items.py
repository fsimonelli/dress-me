from supabase_client import supabase

def get_all_items(processed):
    query = supabase.table("items").select("*")
    if processed:
        query = query.not_.is_("description", "null").neq("description", "")
    else:
        query = query.eq("description", '')
    response = query.limit(100).execute()
    return response.data
  