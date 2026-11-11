export function num(value){
  const raw=String(value ?? '').trim();
  if(!raw) throw Error('Заполните все поля с числами.');
  const normalized=raw.replace(',','.');
  if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized)) throw Error('Проверьте формат введённых чисел.');
  const n=Number(normalized);
  if(!Number.isFinite(n)) throw Error('Число должно быть конечным.');
  return n;
}
export function fmt(n){
  if(Math.abs(n)<1e-12)n=0;
  return Number(n.toFixed(8)).toString().replace('.',',');
}
export function validate(points){
  if(points.length<2)throw Error('Нужно минимум две точки.');
  if(points.length>12)throw Error('Максимум 12 точек.');
  points.forEach((p,i)=>{
    if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Координаты точек должны быть числами.');
    if(points.slice(0,i).some(q=>Math.abs(q.x-p.x)<1e-12))throw Error('Значения X должны быть уникальными. Найдены повторяющиеся узлы.');
  });
}
