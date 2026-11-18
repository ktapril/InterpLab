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

export function lagrange(points) {
  validate(points);

  const coefficients = Array(points.length).fill(0);
  const steps = [{
    title: 'Формула Лагранжа',
    text: 'Строим интерполяционный многочлен как сумму базисных многочленов.'
  }];

  points.forEach((p, i) => {
    let basis = [1];
    let denominator = 1;

    points.forEach((q, j) => {
      if (i === j) return;

      basis = multiply(basis, [-q.x, 1]);
      denominator *= p.x - q.x;
    });

    basis = basis.map(v => v / denominator);

    basis.forEach((v, power) => {
      coefficients[power] += p.y * v;
    });

    const factors = points
      .filter((_, j) => i !== j)
      .map(q => `(x ${q.x < 0 ? '+' : '-'} ${fmt(Math.abs(q.x))})`)
      .join('');

    steps.push({
      title: `Базисный многочлен L${i}(x)`,
      text: `Строим базис для узла x${i} = ${fmt(p.x)}.`,
      math: `L_{${i}}(x)=\\frac{${factors || '1'}}{${fmt(denominator)}}`
    });
  });

  const polynomial = formatPolynomial(coefficients);

  steps.push({
    title: 'Итоговая функция Лагранжа',
    text: 'После раскрытия скобок и приведения подобных слагаемых получаем интерполяционный многочлен.',
    math: `\\boxed{L(x)=${polynomial}}`
  });

  return {
    coefficients,
    polynomial,
    steps,
    evaluate: x => coefficients.reduce((sum, c, i) => sum + c * x ** i, 0)
  };
}