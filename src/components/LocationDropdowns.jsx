import catalog from '../data/ubigeo.json';

export default function LocationDropdowns({ value, onChange }) {
  const department = catalog.departments.find(item => item.departamento === value.region);
  const provinces = catalog.provinces.filter(item => item.departamento_id === department?.id);
  const province = provinces.find(item => item.provincia === value.province);
  const districts = catalog.districts.filter(item => item.provincia_id === province?.id);
  return <>{[
    ['Departamento', 'region', catalog.departments.map(item => item.departamento), false],
    ['Provincia', 'province', provinces.map(item => item.provincia), !department],
    ['Distrito', 'district', districts.map(item => item.distrito), !province],
  ].map(([label, name, options, disabled]) => <label key={name} className="block font-bold text-[#0a2f5f]">{label}<select name={name} value={value[name]} disabled={disabled} onChange={event => onChange({ [name]: event.target.value, ...(name === 'region' ? { province: '', district: '' } : name === 'province' ? { district: '' } : {}) })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3.5 font-normal outline-none focus:border-[#ef5b16] focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100"><option value="">Selecciona {label.toLowerCase()}</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>)}</>;
}
