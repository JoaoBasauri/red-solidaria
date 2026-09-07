import test from 'node:test';
import assert from 'node:assert/strict';
import { fields, validateRequest } from './requestValidation.mjs';
const base = {name:'Persona de prueba',email:'test@example.invalid',description:'Descripción válida',consent:true,latitude:'-12',longitude:'-77',address:'Dirección de prueba'};
function form(type) { return {...base,type,details:Object.fromEntries(fields[type].filter(f=>f[3]).map(([key,,kind])=>[key,kind==='number'?'1':kind==='date'?'2026-09-07':'Prueba']))}; }
for (const type of Object.keys(fields)) test(`${type}: acepta formulario completo y rechaza campos obligatorios vacíos`,()=>{
  const f=form(type);assert.doesNotThrow(()=>validateRequest(f));
  for(const [key,,,required] of fields[type]) if(required) assert.throws(()=>validateRequest({...f,details:{...f.details,[key]:'   '}}));
});
test('rechaza cantidad cero y acepta decimales válidos',()=>{
  const f=form('OFERTA_RECURSO');
  for(const cantidad of ['0','-1','NaN','0.001']) assert.throws(()=>validateRequest({...f,details:{...f.details,cantidad}}));
  assert.doesNotThrow(()=>validateRequest({...f,details:{...f.details,cantidad:'0.25'}}));
});
test('mapa obligatorio solo para emergencia y acopio',()=>{
  for(const type of Object.keys(fields)) {
    const f={...form(type),latitude:'',longitude:''};
    if(['EMERGENCIA','PUNTO_ACOPIO'].includes(type)) assert.throws(()=>validateRequest(f)); else assert.doesNotThrow(()=>validateRequest(f));
  }
});
test('rangos de fechas y longitudes mínimas',()=>{
  for(const [type,start,end] of [['OFERTA_RECURSO','disponibilidad_desde','disponibilidad_hasta'],['PUNTO_ACOPIO','fecha_inicio','fecha_fin']]) {
    const f=form(type);assert.throws(()=>validateRequest({...f,details:{...f.details,[start]:'2026-09-10',[end]:'2026-09-01'}}));
  }
  assert.throws(()=>validateRequest({...form('KIT'),name:'a'}));
  assert.throws(()=>validateRequest({...form('KIT'),description:'  a  '}));
  assert.throws(()=>validateRequest({...form('KIT'),consent:false}));
});
