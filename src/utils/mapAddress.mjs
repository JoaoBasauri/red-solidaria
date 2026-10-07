// Nombres que OpenStreetMap escribe distinto al ubigeo del INEI.
const aliases = { CUZCO: 'CUSCO' };
const normalize = value => { const text = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  .replace(/^(DEPARTAMENTO|REGION|PROVINCIA CONSTITUCIONAL|PROVINCIA|DISTRITO) (DE |DEL )?/, '').trim(); return aliases[text] || text; };
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
  // En Lima Metropolitana OSM no informa la provincia: llega como state_district "Lima Metropolitana".
  const provinceCandidates = [a.province, a.county, a.state_district, a.city, normalize(a.state_district) === 'LIMA METROPOLITANA' && 'LIMA'];
  const districtCandidates = [a.district, a.city_district, a.borough, a.suburb, a.municipality, a.town, a.village, a.city];
  let province = match(provinces, 'provincia', provinceCandidates);
  // Si OSM no trae la provincia, se deduce del distrito cuando su nombre es único dentro de la región.
  if (!province) {
    const found = new Set(districtCandidates.filter(Boolean).flatMap(candidate => catalog.districts.filter(item => item.departamento_id === region.id && normalize(item.distrito) === normalize(candidate)).map(item => item.provincia_id)));
    if (found.size === 1) province = provinces.find(item => item.id === [...found][0]);
  }
  const districts = catalog.districts.filter(item => item.provincia_id === province?.id);
  const district = match(districts, 'distrito', districtCandidates);
  return { ...empty, region: region.departamento, province: province?.provincia || '', district: district?.distrito || '' };
}

// Geocodificación inversa con OpenStreetMap (Nominatim): máximo 1 consulta por segundo según su política de uso.
export async function reverseGeocode(latitude, longitude) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.search = new URLSearchParams({ format:'jsonv2', lat:String(latitude), lon:String(longitude), zoom:'18', addressdetails:'1' });
  const response = await fetch(url, { headers: { 'Accept-Language': 'es' } });
  if (!response.ok) throw new Error('No se pudo consultar la ubicación.');
  return response.json();
}
