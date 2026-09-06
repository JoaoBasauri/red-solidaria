grant select on public.puntos_acopio_publicos to anon, authenticated;
grant select on public.puntos_acopio to anon, authenticated;

drop policy if exists puntos_publicos_lectura on public.puntos_acopio;
create policy puntos_publicos_lectura on public.puntos_acopio
for select to anon, authenticated
using (
  estado='PUBLICADO'
  and (publicado_desde is null or publicado_desde<=now())
  and (publicado_hasta is null or publicado_hasta>now())
);

