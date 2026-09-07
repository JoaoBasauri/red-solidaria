const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  .replace(/^(DEPARTAMENTO|REGION|PROVINCIA CONSTITUCIONAL|PROVINCIA|DISTRITO) (DE |DEL )?/, '').trim();
const match = (items, field, candidates) => candidates.filter(Boolean).map(candidate => items.find(item => normalize(item[field]) === normalize(candidate))).find(Boolean);

export function mapAddress(result, catalog) {
  const a = result.address || {};
  const empty = { region: '', province: '', district: '', address: result.display_name || '' };
  if (a.country_code && a.country_code.toLowerCase() !== 'pe') return empty;
  const regionCandidates = [a.state, a.region, a.state_district];
  // Lima Metropolitana y Callao pueden aparecer sin departamento separado en OSM.
  if (normalize(a.city) === 'LIMA' || normalize(a.state) === 'LIMA METROPOLITANA') regionCandidates.push('LIMA');
  if (normalize(a.city) === 'CALLAO') regionCandidates.push('CALLAO');
  const region = match(catalog.departments, 'departamento', regionCandidates);
  if (!region) return empty;
  const provinces = catalog.provinces.filter(item => item.departamento_id === region.id);
  const province = match(provinces, 'provincia', [a.province, a.county, a.state_district, a.city]);
  const districts = catalog.districts.filter(item => item.provincia_id === province?.id);
  const district = match(districts, 'distrito', [a.district, a.city_district, a.borough, a.suburb, a.municipality, a.town, a.village, a.city]);
  return { ...empty, region: region.departamento, province: province?.provincia || '', district: district?.distrito || '' };
}
