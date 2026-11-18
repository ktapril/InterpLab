import { validate, fmt } from './interpolation.js';

function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  a.forEach((v, i) => b.forEach((w, j) => result[i + j] += v * w));
  return result;
}

function formatPolynomial(coefficients) {
  const terms = [];

  coefficients.forEach((coefficient, power) => {
    if (Math.abs(coefficient) < 0.000005) return;

    const number = Math.abs(coefficient).toFixed(5)
      .replace(/\.?0+$/, '').replace('.', ',');

    const variable = power === 0 ? '' : power === 1 ? 'x' : `x^${power}`;
    const term = `${number}${variable}`;

    if (!terms.length) {
      terms.push(coefficient < 0 ? `-${term}` : term);
    } else {
      terms.push(coefficient < 0 ? `- ${term}` : `+ ${term}`);
    }
  });

  return terms.join(' ') || '0';
}

function formatFactor(x) {
  return x < 0 ? `(x + ${fmt(Math.abs(x))})` : `(x - ${fmt(x)})`;
}

export function newton(points) {
  validate(points);

  const n = points.length;
  const table = points.map(p => [p.y]);

  const steps = [{
    title: 'Таблица разделённых разностей',
    text: 'В первом столбце записаны значения функции. Каждый следующий столбец вычисляется по предыдущему.'
  }];

  for (let k = 1; k < n; k++) {
    for (let i = 0; i < n - k; i++) {
      table[i][k] =
        (table[i + 1][k - 1] - table[i][k - 1]) /
        (points[i + k].x - points[i].x);
    }

    steps.push({
      title: `Разделённые разности ${k}-го порядка`,
      text: `Вычисляем разделённые разности ${k}-го порядка.`,
      math: table.slice(0, n - k).map((r, i) =>
        `f[x_{${i}},\\ldots,x_{${i + k}}]=${fmt(r[k])}`
      ).join('\n')
    });
  }

  const headers = [
    'f[xᵢ]',
    ...Array.from({ length: n - 1 }, (_, i) => `порядок ${i + 1}`)
  ];

  const tableRows = table.map((row, i) => [
    String(i),
    ...Array.from({ length: n }, (_, k) =>
      row[k] === undefined ? '' : fmt(row[k])
    )
  ]);

  steps.splice(1, 0, {
    title: 'Заполненная таблица',
    text: 'Все рассчитанные разделённые разности.',
    table: { headers: ['i', ...headers], rows: tableRows }
  });

  const c = points.map((p, i) => table[0][i]);

  let coefficients = [c[0]];
  let basis = [1];

  for (let i = 1; i < n; i++) {
    basis = multiply(basis, [-points[i - 1].x, 1]);

    const next = Array(Math.max(coefficients.length, basis.length)).fill(0);

    coefficients.forEach((v, j) => next[j] += v);
    basis.forEach((v, j) => next[j] += c[i] * v);

    coefficients = next;
  }

  const newtonForm = c.map((value, i) => {
    const factors = points.slice(0, i).map(p => formatFactor(p.x)).join('');
    return `${fmt(value)}${factors}`;
  }).join(' + ');

  const polynomial = formatPolynomial(coefficients);

  steps.push(
    {
      title: 'Многочлен Ньютона в нераскрытом виде',
      text: 'Коэффициенты берутся из первой строки таблицы разделённых разностей.',
      math: `P(x)=${newtonForm}`
    },
    {
      title: 'Раскрытый многочлен Ньютона',
      text: 'Раскрываем скобки и приводим подобные слагаемые.',
      math: `\\boxed{P(x)=${polynomial}}`
    }
  );

  return {
    coefficients,
    newtonForm,
    polynomial,
    steps,
    evaluate: x => coefficients.reduce((sum, v, i) => sum + v * x ** i, 0)
  };
}