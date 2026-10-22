import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSharedRecord, type SharedRecord } from "./shared";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSharedRecord(token: string): Promise<SharedRecord | null> {
  if (!UUID.test(token)) return null;
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("get_shared_record", { p_token: token });
    if (error || !Array.isArray(data)) return null;
    return buildSharedRecord(data[0] ?? null);
  } catch {
    return null;
  }
}
