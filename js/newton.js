import {validate,fmt} from './interpolation.js';
export function newton(points,x){
  validate(points);
  const n=points.length,table=points.map(p=>[p.y]);
  const steps=[{title:'Таблица разделённых разностей',text:'В первом столбце записаны значения функции. Каждый следующий столбец вычисляется по предыдущему.'}];
  for(let k=1;k<n;k++){
    for(let i=0;i<n-k;i++){
      table[i][k]=(table[i+1][k-1]-table[i][k-1])/(points[i+k].x-points[i].x);
    }
    steps.push({
      title:`Разделённые разности ${k}-го порядка`,
      text:`Вычисляем значения для всех доступных групп из ${k+1} узлов.`,
      math:table.slice(0,n-k).map((r,i)=>`f[x${i}, …, x${i+k}] = ${fmt(r[k])}`).join('\n')
    });
  }
  const headers=['f[xᵢ]',...Array.from({length:n-1},(_,i)=>`порядок ${i+1}`)];
  const tableRows=table.map((row,i)=>[String(i),...Array.from({length:n},(_,k)=>row[k]===undefined?'':fmt(row[k]))]);
  steps.splice(1,0,{title:'Заполненная таблица',text:'В таблице собраны исходные значения и все рассчитанные разделённые разности.',table:{headers:['i',...headers],rows:tableRows}});
  const c=points.map((p,i)=>table[0][i]);
  let value=c[n-1];
  for(let i=n-2;i>=0;i--)value=value*(x-points[i].x)+c[i];
const polynomial = c.map((v,i) => {
  const factors = points.slice(0,i)
    .map(p => `(x-${fmt(p.x)})`).join('');
  return `${fmt(v)}${factors}`;
}).join(' + ');  steps.push(
    {title:'Многочлен Ньютона',text:'Коэффициенты многочлена берём из первой строки таблицы разделённых разностей.',math:`P(x) = ${polynomial}`},
    {title:'Вычисление в заданной точке',text:'Подставляем X и последовательно выполняем вычисления.',math:`P(${fmt(x)}) = ${fmt(value)}`}
  );
  return {
    value,steps,coefficients:c,
    evaluate:t=>{let v=c[n-1];for(let i=n-2;i>=0;i--)v=v*(t-points[i].x)+c[i];return v;}
  };
}
