-- El formulario ya no solicita tipo de kit. Conservar valores históricos.
begin;
alter table public.solicitud_kit alter column tipo_kit drop not null;
commit;
