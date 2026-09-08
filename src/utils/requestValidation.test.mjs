import test from 'node:test';
import assert from 'node:assert/strict';
import { fields, requestFields, validateRequest } from './requestValidation.mjs';
import { options } from './requestOptions.mjs';
const base = {name:'Persona de prueba',email:'test@example.invalid',phone:'999000000',description:'Descripción válida',consent:true,latitude:'-12',longitude:'-77',address:'Dirección de prueba',region:'LIMA',province:'LIMA',district:'LINCE'};
function form(type, participant = 'Organización') {
  const details = { tipo_participante: participant, confirmacion_veracidad: true };
  for (const [key,,kind,required] of requestFields(type, details)) if(required) details[key] = key === 'tipo_participante' ? participant : key === 'dni' ? '12345678' : options[key]?.[0] || (kind === 'number' ? '1' : kind === 'date' ? '2026-09-07' : kind === 'time' ? '12:30' : kind === 'email' ? 'contacto@example.invalid' : 'Prueba');
  return {...base,type,details};
}
for (const type of Object.keys(fields)) test(`${type}: acepta formulario completo y rechaza campos obligatorios vacíos`,()=>{
  const f=form(type);assert.doesNotThrow(()=>validateRequest(f));
  for(const [key,,,required] of requestFields(type, f.details)) if(required) assert.throws(()=>validateRequest({...f,details:{...f.details,[key]:'   '}}));
});
test('KIT no solicita tipo de kit ni asunto y valida sin ambos',()=>{
  const f=form('KIT');
  assert.ok(!requestFields('KIT').some(([name])=>name==='tipo_kit'));
  assert.equal(f.details.tipo_kit, undefined);
  assert.equal(f.subject, undefined);
  assert.doesNotThrow(()=>validateRequest(f));
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

test('aliado persona no requiere organización y exige DNI', () => {
  const f = form('ALIADO', 'Persona');
  assert.doesNotThrow(() => validateRequest(f));
  assert.ok(!requestFields('ALIADO', f.details).some(([key]) => key === 'nombre_organizacion'));
  assert.throws(() => validateRequest({...f, details:{...f.details, dni:'123'}}));
});
test('acopio dentro de aliado exige dirección, referencia y horarios', () => {
  const f = form('ALIADO');
  f.details.tipo_aliado = 'Aliado logístico; Punto de acopio';
  assert.throws(() => validateRequest(f));
  Object.assign(f.details, {acopio_abierto_publico:'Sí',acopio_direccion:'Dirección',acopio_referencia:'Referencia',acopio_horarios:'Lunes de 9 a 18'});
  assert.doesNotThrow(() => validateRequest(f));
});
test('rechaza opciones inventadas, falta de veracidad y ubicación incompleta', () => {
  const f = form('EMERGENCIA');
  assert.throws(() => validateRequest({...f,details:{...f.details,tipo_emergencia:'Inventada'}}));
  assert.throws(() => validateRequest({...f,district:''}));
  const ally = form('ALIADO');
  assert.throws(() => validateRequest({...ally,details:{...ally.details,confirmacion_veracidad:false}}));
});
