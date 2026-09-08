import catalog from '../data/ubigeo.json'
import StyledSelect from './StyledSelect'

export default function LocationDropdowns({ value, onChange }) {
  const department = catalog.departments.find(item => item.departamento === value.region)
  const provinces = catalog.provinces.filter(item => item.departamento_id === department?.id)
  const province = provinces.find(item => item.provincia === value.province)
  const districts = catalog.districts.filter(item => item.provincia_id === province?.id)
  return <>{[
    ['Región', 'region', catalog.departments.map(item => item.departamento), false],
    ['Provincia', 'province', provinces.map(item => item.provincia), !department],
    ['Distrito', 'district', districts.map(item => item.distrito), !province],
  ].map(([label, name, options, disabled]) => <StyledSelect key={name} label={label} required value={value[name]} options={options} disabled={disabled} onChange={selected => onChange({ [name]: selected, ...(name === 'region' ? { province: '', district: '' } : name === 'province' ? { district: '' } : {}) })} />)}</>
}
