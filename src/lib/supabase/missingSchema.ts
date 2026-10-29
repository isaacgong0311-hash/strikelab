/**
 * True when a Supabase error means a migration hasn't been applied yet (the
 * function or table doesn't exist), as opposed to the database failing.
 * Guards that fail closed on errors still let these through, so an
 * unapplied migration never locks students out.
 *
 * 42883 undefined function, 42P01 undefined table; PGRST202 / PGRST205 are
 * PostgREST's "not in the schema cache" for functions / tables.
 */
export function isMissingSchemaError(error: { code?: string } | null | undefined): boolean {
  return ["42883", "42P01", "PGRST202", "PGRST205"].includes(error?.code ?? "");
}
