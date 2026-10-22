-- Read-only inventory of public tables created by StrikeLab migrations.
-- A test keeps this list in sync with supabase/migrations/.
-- RLS enabled is necessary for student data, but policy correctness still
-- requires role-based test accounts. A zero policy count can be intentional
-- for a server-only table; investigate it rather than adding broad access.
with expected(table_name) as (
  values
    ('ai_usage'),
    ('assignments'),
    ('capstone_access_log'),
    ('capstone_submissions'),
    ('certificates'),
    ('challenge_completions'),
    ('class_members'),
    ('classes'),
    ('hint_usage'),
    ('intensive_waitlist'),
    ('lesson_completions'),
    ('lesson_submissions'),
    ('profiles'),
    ('progress'),
    ('rate_limits'),
    ('sandbox_accounts'),
    ('sandbox_positions'),
    ('sandbox_trades'),
    ('season_attempts'),
    ('season_challenges'),
    ('seasons'),
    ('session_completions'),
    ('subscriptions')
)
select e.table_name,
       c.oid is not null as table_present,
       coalesce(c.relrowsecurity, false) as rls_enabled,
       count(p.policyname)::integer as policy_count,
       case when c.oid is null then 'MISSING'
            when not c.relrowsecurity then 'RLS OFF'
            else 'RLS ON' end as state
from expected e
left join pg_namespace n on n.nspname = 'public'
left join pg_class c on c.relnamespace = n.oid and c.relname = e.table_name and c.relkind in ('r', 'p')
left join pg_policies p on p.schemaname = 'public' and p.tablename = e.table_name
group by e.table_name, c.oid, c.relrowsecurity
order by e.table_name;
