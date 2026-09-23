-- Honest baseline (docs/gtm/baseline-template.md): paste each number into
-- the template with today's date. Stripe numbers (paying subscribers, MRR)
-- come from the Stripe dashboard, not from here.
select
  (select count(*) from auth.users) as registered_users,
  (select count(*) from public.progress where jsonb_array_length(completed) > 0) as users_with_a_completed_lesson,
  (select coalesce(sum(jsonb_array_length(completed)), 0) from public.progress) as total_lesson_completions,
  (select count(*) from public.classes) as classes_created,
  (select count(*) from public.class_members) as students_enrolled_in_a_class,
  (select count(*) from public.classes where template_id is not null) as cohorts_launched,
  (select count(*) from public.subscriptions where status in ('active', 'trialing')) as active_subscriptions_in_db;

-- Signups by acquisition source (?src=).
select coalesce(signup_source, '(none)') as source, count(*) as signups
from public.profiles
group by 1
order by 2 desc;
