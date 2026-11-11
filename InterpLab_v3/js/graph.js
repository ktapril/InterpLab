import {fmt} from './interpolation.js';
export function drawGraph(el,points,results,target,legendEl){
  const W=720,H=340,L=62,R=22,T=20,B=48;
  const x0=Math.min(...points.map(p=>p.x)),x1=Math.max(...points.map(p=>p.x));
  const span=x1-x0||1,xmin=x0-span*.18,xmax=x1+span*.18;
  const vals=results.flatMap(r=>Array.from({length:181},(_,i)=>r.evaluate(xmin+(xmax-xmin)*i/180))).concat(points.map(p=>p.y));
  if(target>=xmin&&target<=xmax)results.forEach(r=>vals.push(r.evaluate(target)));
  let ymin=Math.min(...vals),ymax=Math.max(...vals);
  if(ymin===ymax){ymin-=1;ymax+=1;}
  const pad=(ymax-ymin)*.12;ymin-=pad;ymax+=pad;
  const X=x=>L+(x-xmin)/(xmax-xmin)*(W-L-R);
  const Y=y=>H-B-(y-ymin)/(ymax-ymin)*(H-T-B);
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="График интерполяционного многочлена">`;
  for(let i=0;i<=5;i++){
    const y=ymin+(ymax-ymin)*i/5,x=xmin+(xmax-xmin)*i/5;
    svg+=`<line x1="${L}" y1="${Y(y)}" x2="${W-R}" y2="${Y(y)}" stroke="#edf0f5"/>`;
    svg+=`<text x="${L-9}" y="${Y(y)+4}" text-anchor="end" font-size="10" fill="#8992a2">${fmt(y)}</text>`;
    svg+=`<line x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${H-B}" stroke="#f0f2f6"/>`;
    svg+=`<text x="${X(x)}" y="${H-17}" text-anchor="middle" font-size="10" fill="#8992a2">${fmt(x)}</text>`;
  }
  svg+=`<line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#aeb7c6"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#aeb7c6"/>`;
  svg+=`<text x="${W-R}" y="${H-3}" text-anchor="end" font-size="11" fill="#68748b">x</text><text x="14" y="${T+4}" font-size="11" fill="#68748b">y</text>`;
  const colors=['#5575d6','#2da88a'];
  results.forEach((r,k)=>{
    let d='';
    for(let i=0;i<=220;i++){
      const x=xmin+(xmax-xmin)*i/220,y=r.evaluate(x);
      d+=(i?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2)+' ';
    }
    svg+=`<path d="${d}" fill="none" stroke="${colors[k]}" stroke-width="2.8" stroke-linecap="round"/>`;
  });
  points.forEach((p,i)=>{
    svg+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5.5" fill="#e18a54" stroke="#fff" stroke-width="2"><title>Узел ${i+1}: (${fmt(p.x)}; ${fmt(p.y)})</title></circle>`;
  });
  if(target>=xmin&&target<=xmax){
    const y=results[0].evaluate(target);
    svg+=`<line x1="${X(target)}" y1="${T}" x2="${X(target)}" y2="${H-B}" stroke="#d69b45" stroke-dasharray="5 4"/>`;
    svg+=`<circle cx="${X(target)}" cy="${Y(y)}" r="7" fill="#d69b45" stroke="#fff" stroke-width="2"><title>Точка вычисления (${fmt(target)}; ${fmt(y)})</title></circle>`;
  }
  svg+='</svg>';el.innerHTML=svg;
  const labels=[['#e18a54','Исходные точки']];
  if(results.length===2){labels.push([colors[0],'Лагранж'],[colors[1],'Ньютон']);}
  else labels.push([colors[0],results[0].name.replace('Метод ','')]);
  labels.push(['#d69b45',`Точка вычисления x = ${fmt(target)}`]);
  legendEl.innerHTML=labels.map(([color,label],i)=>`<span class="legend-item"><i class="${i===0?'legend-dot':'legend-line'}" style="background:${color}"></i>${label}</span>`).join('');
}
