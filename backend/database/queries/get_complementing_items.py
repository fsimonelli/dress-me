from database.supabase_client import supabase


def get_complementing_items(outfit_id, item_idx):
    response = (
        supabase.table("items")
        .select("*")
        .eq("outfit_id", outfit_id)
        .neq("item_idx", item_idx)
        .execute()
    )
    return response.data
