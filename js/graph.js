import { fmt } from './interpolation.js';

export function drawGraph(el, points, results, legendEl) {
  const W = 1000, H = 520, L = 75, R = 30, T = 25, B = 60;

  const tickFmt = n => Number(n.toFixed(2)).toString().replace('.', ',');

  const x0 = Math.min(...points.map(p => p.x));
  const x1 = Math.max(...points.map(p => p.x));
  const span = x1 - x0 || 1;
  const xmin = x0 - span * 0.18;
  const xmax = x1 + span * 0.18;

  const vals = results.flatMap(r =>
    Array.from({ length: 181 }, (_, i) =>
      r.evaluate(xmin + (xmax - xmin) * i / 180)
    )
  ).concat(points.map(p => p.y));

  let ymin = Math.min(...vals);
  let ymax = Math.max(...vals);

  if (ymin === ymax) {
    ymin -= 1;
    ymax += 1;
  }

  const pad = (ymax - ymin) * 0.12;
  ymin -= pad;
  ymax += pad;

  const mapX = x => L + ((x - xmin) / (xmax - xmin)) * (W - L - R);
  const mapY = y => H - B - ((y - ymin) / (ymax - ymin)) * (H - T - B);

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="График интерполяционного многочлена">`;

  for (let i = 0; i <= 5; i++) {
    const y = ymin + (ymax - ymin) * i / 5;
    const x = xmin + (xmax - xmin) * i / 5;

    svg += `<line x1="${L}" y1="${mapY(y)}" x2="${W - R}" y2="${mapY(y)}" stroke="#edf0f5"/>`;
    svg += `<text x="${L - 9}" y="${mapY(y) + 4}" text-anchor="end" font-size="10" fill="#8992a2">${tickFmt(y)}</text>`;

    svg += `<line x1="${mapX(x)}" y1="${T}" x2="${mapX(x)}" y2="${H - B}" stroke="#f0f2f6"/>`;
    svg += `<text x="${mapX(x)}" y="${H - 17}" text-anchor="middle" font-size="10" fill="#8992a2">${tickFmt(x)}</text>`;
  }

  svg += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="#aeb7c6"/>`;
  svg += `<line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" stroke="#aeb7c6"/>`;
  svg += `<text x="${W - R}" y="${H - 3}" text-anchor="end" font-size="11" fill="#68748b">x</text>`;
  svg += `<text x="14" y="${T + 4}" font-size="11" fill="#68748b">y</text>`;

  const curveColor = '#5575d6';

  results.slice(0, 1).forEach(r => {
    let d = '';

    for (let i = 0; i <= 220; i++) {
      const x = xmin + (xmax - xmin) * i / 220;
      const y = r.evaluate(x);
      d += (i ? 'L' : 'M') + mapX(x).toFixed(2) + ' ' + mapY(y).toFixed(2) + ' ';
    }

    svg += `<path d="${d}" fill="none" stroke="${curveColor}" stroke-width="2.8" stroke-linecap="round"/>`;
  });

  points.forEach((p, i) => {
    svg += `<circle cx="${mapX(p.x)}" cy="${mapY(p.y)}" r="5.5" fill="#e18a54" stroke="#fff" stroke-width="2">`;
    svg += `<title>Узел ${i + 1}: (${fmt(p.x)}; ${fmt(p.y)})</title>`;
    svg += `</circle>`;
  });

  svg += '</svg>';
  el.innerHTML = svg;

  const labels = [
    ['#e18a54', 'Исходные точки'],
    [curveColor, 'Интерполяционная функция']
  ];

  legendEl.innerHTML = labels.map(([color, label], i) => {
    const iconClass = i === 0 ? 'legend-dot' : 'legend-line';
    return `<span class="legend-item"><i class="${iconClass}" style="background:${color}"></i>${label}</span>`;
  }).join('');
}
