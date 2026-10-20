-- El banner de aliados lo configuran todos los usuarios activos del panel OLI, no solo ADMIN.
drop policy aliados_logos_admin on public.aliados_logos;
create policy aliados_logos_panel on public.aliados_logos for all to authenticated
  using (public.es_trabajador_oli()) with check (public.es_trabajador_oli());

drop policy logos_aliados_lectura on storage.objects;
create policy logos_aliados_lectura on storage.objects for select to anon, authenticated using (
  bucket_id = 'logos-aliados' and (public.es_trabajador_oli() or exists(
    select 1 from public.aliados_publicos a where a.storage_path = name
  ))
);

drop policy logos_aliados_admin_insert on storage.objects;
drop policy logos_aliados_admin_update on storage.objects;
drop policy logos_aliados_admin_delete on storage.objects;
create policy logos_aliados_panel_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'logos-aliados' and public.es_trabajador_oli());
create policy logos_aliados_panel_update on storage.objects for update to authenticated
  using (bucket_id = 'logos-aliados' and public.es_trabajador_oli()) with check (bucket_id = 'logos-aliados' and public.es_trabajador_oli());
create policy logos_aliados_panel_delete on storage.objects for delete to authenticated
  using (bucket_id = 'logos-aliados' and public.es_trabajador_oli());
