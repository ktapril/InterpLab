import { fmt } from './interpolation.js';

export function drawGraph(el, points, results, target, legendEl) {
  // Константы размеров и отступов графика
  const W = 720, H = 340, L = 62, R = 22, T = 20, B = 48;

  // Форматирование чисел для осей (округление и замена точки на запятую)
  const tickFmt = n => Number(n.toFixed(2)).toString().replace('.', ',');

  // Вычисление границ осей координат
  const x0 = Math.min(...points.map(p => p.x));
  const x1 = Math.max(...points.map(p => p.x));
  const span = x1 - x0 || 1;
  const xmin = x0 - span * 0.18;
  const xmax = x1 + span * 0.18;

  // Сбор всех значений Y для определения вертикальных границ
  const vals = results.flatMap(r =>
    Array.from({ length: 181 }, (_, i) => r.evaluate(xmin + (xmax - xmin) * i / 180))
  ).concat(points.map(p => p.y));

  if (target >= xmin && target <= xmax) {
    results.forEach(r => vals.push(r.evaluate(target)));
  }

  let ymin = Math.min(...vals);
  let ymax = Math.max(...vals);

  // Обработка случая горизонтальной линии (вырожденный случай)
  if (ymin === ymax) {
    ymin -= 1;
    ymax += 1;
  }

  // Добавление визуальных отступов по вертикали
  const pad = (ymax - ymin) * 0.12;
  ymin -= pad;
  ymax += pad;

  // Функции преобразования координат данных в координаты SVG
  const mapX = x => L + ((x - xmin) / (xmax - xmin)) * (W - L - R);
  const mapY = y => H - B - ((y - ymin) / (ymax - ymin)) * (H - T - B);

  // Инициализация SVG-контейнера
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="График интерполяционного многочлена">`;

  // Отрисовка сетки и меток осей
  for (let i = 0; i <= 5; i++) {
    const y = ymin + (ymax - ymin) * i / 5;
    const x = xmin + (xmax - xmin) * i / 5;

    // Горизонтальные линии и метки оси Y
    svg += `<line x1="${L}" y1="${mapY(y)}" x2="${W - R}" y2="${mapY(y)}" stroke="#edf0f5"/>`;
    svg += `<text x="${L - 9}" y="${mapY(y) + 4}" text-anchor="end" font-size="10" fill="#8992a2">${tickFmt(y)}</text>`;

    // Вертикальные линии и метки оси X
    svg += `<line x1="${mapX(x)}" y1="${T}" x2="${mapX(x)}" y2="${H - B}" stroke="#f0f2f6"/>`;
    svg += `<text x="${mapX(x)}" y="${H - 17}" text-anchor="middle" font-size="10" fill="#8992a2">${tickFmt(x)}</text>`;
  }

  // Основные оси координат и буквенные подписи
  svg += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="#aeb7c6"/>`;
  svg += `<line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" stroke="#aeb7c6"/>`;
  svg += `<text x="${W - R}" y="${H - 3}" text-anchor="end" font-size="11" fill="#68748b">x</text>`;
  svg += `<text x="14" y="${T + 4}" font-size="11" fill="#68748b">y</text>`;

  // Отрисовка кривой интерполяции
  // (Если методов два, кривая рисуется одна, так как многочлен идентичен)
  const curves = results.length === 2 ? [results[0]] : results;
  const curveColor = '#5575d6';

  curves.forEach(r => {
    let d = '';
    for (let i = 0; i <= 220; i++) {
      const x = xmin + (xmax - xmin) * i / 220;
      const y = r.evaluate(x);
      d += (i ? 'L' : 'M') + mapX(x).toFixed(2) + ' ' + mapY(y).toFixed(2) + ' ';
    }
    svg += `<path d="${d}" fill="none" stroke="${curveColor}" stroke-width="2.8" stroke-linecap="round"/>`;
  });

  // Отрисовка исходных узлов интерполяции
  points.forEach((p, i) => {
    svg += `<circle cx="${mapX(p.x)}" cy="${mapY(p.y)}" r="5.5" fill="#e18a54" stroke="#fff" stroke-width="2">`;
    svg += `<title>Узел ${i + 1}: (${fmt(p.x)}; ${fmt(p.y)})</title>`;
    svg += `</circle>`;
  });

  // Отрисовка линии и точки вычисления (если попадает в диапазон)
  if (target >= xmin && target <= xmax) {
    const y = results[0].evaluate(target);
    svg += `<line x1="${mapX(target)}" y1="${T}" x2="${mapX(target)}" y2="${H - B}" stroke="#d69b45" stroke-dasharray="5 4"/>`;
    svg += `<circle cx="${mapX(target)}" cy="${mapY(y)}" r="7" fill="#d69b45" stroke="#fff" stroke-width="2">`;
    svg += `<title>Точка вычисления (${fmt(target)}; ${tickFmt(y)})</title>`;
    svg += `</circle>`;
  }

  svg += '</svg>';
  el.innerHTML = svg;

  // Формирование легенды графика
  const labels = [['#e18a54', 'Исходные точки']];

  if (results.length === 2) {
    labels.push([curveColor, 'Общий многочлен (Лагранж = Ньютон)']);
  } else {
    labels.push([curveColor, results[0].name.replace('Метод ', '')]);
  }

  if (target >= xmin && target <= xmax) {
    labels.push(['#d69b45', `Точка вычисления x = ${fmt(target)}`]);
  }

  legendEl.innerHTML = labels.map(([color, label], i) => {
    const iconClass = i === 0 ? 'legend-dot' : 'legend-line';
    return `<span class="legend-item"><i class="${iconClass}" style="background:${color}"></i>${label}</span>`;
  }).join('');
}