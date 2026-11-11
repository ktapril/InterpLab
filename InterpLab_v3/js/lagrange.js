import {validate,fmt} from './interpolation.js';
export function lagrange(points,x){
  validate(points);
  let value=0;
  const steps=[{title:'Формула Лагранжа',text:'Интерполяционный многочлен представляется как сумма yᵢ · Lᵢ(x). Найдём каждый базисный многочлен.'}];
  points.forEach((p,i)=>{
    let numerator=1,denominator=1;
    const factors=[];
    points.forEach((q,j)=>{
      if(i!==j){
        numerator*=x-q.x; denominator*=p.x-q.x;
        factors.push(`(${fmt(x)} − ${fmt(q.x)}) / (${fmt(p.x)} − ${fmt(q.x)})`);
      }
    });
    const basis=numerator/denominator,part=p.y*basis;
    value+=part;
    steps.push({
      title:`Базисный многочлен L${i}(x)`,
      text:`Для узла x${i} = ${fmt(p.x)} вычисляем произведение отношений.`,
      math:`L${i}(${fmt(x)}) = ${factors.join(' · ')} = ${fmt(basis)}\ny${i} · L${i} = ${fmt(p.y)} · ${fmt(basis)} = ${fmt(part)}`
    });
  });
  steps.push({title:'Итоговое значение',text:'Складываем вклады всех базисных многочленов.',math:`P(${fmt(x)}) = ${points.map((p,i)=>fmt(p.y)).join(' · Lᵢ + ')}\nP(${fmt(x)}) = ${fmt(value)}`});
  return {
    value,steps,
    evaluate:t=>points.reduce((sum,p,i)=>{
      let basis=1;
      points.forEach((q,j)=>{if(i!==j)basis*=(t-q.x)/(p.x-q.x);});
      return sum+p.y*basis;
    },0)
  };
}
