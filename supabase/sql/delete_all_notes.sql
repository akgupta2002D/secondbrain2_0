-- One-shot: wipe notes. Run in the Supabase SQL editor.
-- Not a schema migration — do not treat this as 005.
--
-- Peek first (optional):
--   select id, left("text", 80) as preview, created_at from public.notes order by created_at desc;
--
-- Blanks only (the old "open Notes creates a row" leftovers):
--   delete from public.notes where btrim("text") = '';

delete from public.notes;
