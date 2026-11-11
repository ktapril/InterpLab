import { validate, fmt } from './interpolation.js';

export function lagrange(points, x) {
  // Валидация входных данных
  validate(points);

  // Инициализация переменных и начального шага
  let value = 0;
  const steps = [
    {
      title: 'Формула Лагранжа',
      text: 'Интерполяционный многочлен представляется как сумма yᵢ · Lᵢ(x). Находим каждый базисный многочлен.'
    }
  ];

  // Вычисление базисных многочленов для каждого узла
  points.forEach((p, i) => {
    let numerator = 1;
    let denominator = 1;
    const factors = [];

    points.forEach((q, j) => {
      if (i !== j) {
        numerator *= (x - q.x);
        denominator *= (p.x - q.x);
        factors.push(`\\frac{(${fmt(x)} - ${fmt(q.x)})}{(${fmt(p.x)} - ${fmt(q.x)})}`);
      }
    });

    const basis = numerator / denominator;
    const part = p.y * basis;
    value += part;

    steps.push({
      title: `Базисный многочлен L${i}(x)`,
      text: `Для узла x${i} = ${fmt(p.x)} вычисляется произведение отношений.`,
      math: `L_{${i}}(${fmt(x)}) = ${factors.join(' \\cdot ')} = ${fmt(basis)}\ny_{${i}} \\cdot L_{${i}} = ${fmt(p.y)} \\cdot ${fmt(basis)} = ${fmt(part)}`
    });
  });

  // Формирование итоговой суммы
  const sumExpression = points
    .map((p, i) => `${fmt(p.y)} \\cdot L_{${i}}(${fmt(x)})`)
    .join(' + ');

  steps.push({
    title: 'Итоговое значение',
    text: 'Складываются вклады всех базисных многочленов.',
    math: `P(${fmt(x)}) = ${sumExpression}\nP(${fmt(x)}) = ${fmt(value)}`
  });

  // Возврат результата и функции для повторного вычисления
  return {
    value,
    steps,
    evaluate: (t) => points.reduce((sum, p, i) => {
      let basis = 1;
      points.forEach((q, j) => {
        if (i !== j) {
          basis *= (t - q.x) / (p.x - q.x);
        }
      });
      return sum + p.y * basis;
    }, 0)
  };
}