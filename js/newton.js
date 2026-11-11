import { validate, fmt } from './interpolation.js';

export function newton(points, x) {
  // Валидация входных данных
  validate(points);

  const n = points.length;

  // Инициализация таблицы разделённых разностей
  const table = points.map(p => [p.y]);

  // Начальный шаг описания
  const steps = [
    {
      title: 'Таблица разделённых разностей',
      text: 'В первом столбце записаны значения функции. Каждый следующий столбец вычисляется по предыдущему.'
    }
  ];

  // Построение разделённых разностей всех порядков
  for (let k = 1; k < n; k++) {
    for (let i = 0; i < n - k; i++) {
      table[i][k] = (table[i + 1][k - 1] - table[i][k - 1]) / (points[i + k].x - points[i].x);
    }

    steps.push({
      title: `Разделённые разности ${k}-го порядка`,
      text: `Вычисляются значения для всех доступных групп из ${k + 1} узлов.`,
      math: table.slice(0, n - k).map((r, i) =>
        `f[x_{${i}}, \\ldots, x_{${i + k}}] = ${fmt(r[k])}`
      ).join('\n')
    });
  }

  // Формирование заголовков и строк итоговой таблицы
  const headers = [
    'f[xᵢ]',
    ...Array.from({ length: n - 1 }, (_, i) => `порядок ${i + 1}`)
  ];

  const tableRows = table.map((row, i) => [
    String(i),
    ...Array.from({ length: n }, (_, k) => row[k] === undefined ? '' : fmt(row[k]))
  ]);

  // Вставка шага с полной таблицей после первого описания
  steps.splice(1, 0, {
    title: 'Заполненная таблица',
    text: 'В таблице собраны исходные значения и все рассчитанные разделённые разности.',
    table: {
      headers: ['i', ...headers],
      rows: tableRows
    }
  });

  // Коэффициенты многочлена — первая строка таблицы
  const c = points.map((p, i) => table[0][i]);

  // Вычисление значения в точке X по схеме Горнера
  let value = c[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    value = value * (x - points[i].x) + c[i];
  }

  // Формирование аналитического вида многочлена
  const polynomial = c.map((v, i) => {
    const factors = points.slice(0, i)
      .map(p => `(x - ${fmt(p.x)})`)
      .join('');
    return `${fmt(v)}${factors}`;
  }).join(' + ');

  // Добавление шагов с многочленом и итоговым вычислением
  steps.push(
    {
      title: 'Многочлен Ньютона',
      text: 'Коэффициенты многочлена берутся из первой строки таблицы разделённых разностей.',
      math: `P(x) = ${polynomial}`
    },
    {
      title: 'Вычисление в заданной точке',
      text: 'Подставляется X и последовательно выполняются вычисления.',
      math: `P(${fmt(x)}) = ${fmt(value)}`
    }
  );

  // Возврат результата, шагов и функции для повторного вычисления
  return {
    value,
    steps,
    coefficients: c,
    evaluate: (t) => {
      let v = c[n - 1];
      for (let i = n - 2; i >= 0; i--) {
        v = v * (t - points[i].x) + c[i];
      }
      return v;
    }
  };
}