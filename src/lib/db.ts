import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function dbInsert(table: string, row: any) {
  const { error, data } = await supabase.from(table as any).insert(row).select().single();
  if (error) { toast.error(error.message); throw error; }
  return data;
}
export async function dbUpdate(table: string, id: string, row: any) {
  const { error, data } = await supabase.from(table as any).update(row).eq("id", id).select().single();
  if (error) { toast.error(error.message); throw error; }
  return data;
}
export async function dbDelete(table: string, id: string) {
  const { error } = await supabase.from(table as any).delete().eq("id", id);
  if (error) { toast.error(error.message); throw error; }
}
