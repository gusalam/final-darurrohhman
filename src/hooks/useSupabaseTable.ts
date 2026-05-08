import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { UnitKey } from "@/lib/units";

type TableName = keyof Database["public"]["Tables"] | (string & {});

interface Options {
  /** Filter kolom unit (jika tabel punya kolom unit). */
  unit?: UnitKey | null;
  /** Kolom order. Default created_at desc. */
  orderBy?: { column: string; ascending?: boolean };
  /** Filter equality tambahan. */
  filters?: Record<string, string | number | boolean | null>;
  /** Kolom yang dipilih (default *). */
  select?: string;
  /** Aktifkan realtime subscription. Default true. */
  realtime?: boolean;
}

/**
 * Hook generik: fetch list dari sebuah tabel + subscribe realtime.
 * Re-fetch saat ada INSERT/UPDATE/DELETE pada tabel itu.
 */
export function useSupabaseTable<T = any>(table: TableName, options: Options = {}) {
  const { unit, orderBy = { column: "created_at", ascending: false }, filters, select = "*", realtime = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters ?? {});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    let q = supabase.from(table as any).select(select);
    if (unit) q = q.eq("unit", unit);
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v === null || v === undefined) continue;
        q = q.eq(k, v as any);
      }
    }
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    const { data: rows, error: err } = await q;
    if (err) setError(err.message);
    else { setData((rows ?? []) as T[]); setError(null); }
    setLoading(false);
  }, [table, unit, select, orderBy.column, orderBy.ascending, filtersKey]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!realtime) return;
    const channel = supabase
      .channel(`rt-${String(table)}-${unit ?? "all"}-${Math.random().toString(36).slice(2, 7)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: String(table) }, () => {
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [table, unit, realtime, fetchAll]);

  return { data, loading, error, refetch: fetchAll, setData } as const;
}

/** Variant single-row (mis. site_settings). */
export function useSupabaseSingle<T = any>(table: TableName, options: Options = {}) {
  const { data, loading, error, refetch } = useSupabaseTable<T>(table, { ...options, orderBy: options.orderBy ?? { column: "created_at", ascending: true } });
  const row = useMemo(() => (data && data.length > 0 ? data[0] : null), [data]);
  return { row, loading, error, refetch };
}
