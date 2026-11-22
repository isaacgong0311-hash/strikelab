/**
 * GET /seasons/calendar.ics: the current season's challenge dates as a
 * calendar file, so a student who signs up early is reminded when week 1
 * opens. Public: seasons and challenges are public rows (0024).
 */
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSeasonCalendar, type CalendarChallenge } from "@/lib/seasons/calendar";
import { PLANNED_SEASON } from "@/lib/seasons/planned";
import { seasonDate } from "@/lib/seasons/seasonDate";
import { getTemplate } from "@/lib/seasons/templates";

export const dynamic = "force-dynamic";

export async function GET() {
  let season: { id: string; title: string; startsOn: string } = { id: "planned", title: PLANNED_SEASON.title, startsOn: PLANNED_SEASON.startsOn };
  let challenges: CalendarChallenge[] = [];

  const supabase = await getSupabaseServer();
  if (supabase) {
    const today = seasonDate(new Date());
    const { data: seasons } = await supabase.from("seasons").select("id, title, starts_on").gte("ends_on", today).order("starts_on").limit(1);
    const row = seasons?.[0] as { id: string; title: string; starts_on: string } | undefined;
    if (row) {
      season = { id: row.id, title: row.title, startsOn: row.starts_on };
      const { data } = await supabase
        .from("season_challenges")
        .select("id, week, template_slug, opens_at, closes_at, time_limit_minutes")
        .eq("season_id", row.id)
        .order("week");
      challenges = ((data ?? []) as { id: string; week: number; template_slug: string; opens_at: string; closes_at: string; time_limit_minutes: number }[])
        .map((c) => ({
          id: c.id,
          week: c.week,
          title: getTemplate(c.template_slug)?.title ?? "Challenge",
          minutes: c.time_limit_minutes,
          opensAt: c.opens_at,
          closesAt: c.closes_at,
        }));
    }
  }

  return new Response(buildSeasonCalendar(season, challenges), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="strikelab-${season.id}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
