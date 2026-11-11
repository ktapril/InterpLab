// Импорт зависимостей
import { num, fmt, validate } from './interpolation.js';
import { lagrange } from './lagrange.js';
import { newton } from './newton.js';
import { drawGraph } from './graph.js';

// Состояние приложения
const pointsBody = document.querySelector('#points');
let rows = [
  { x: '', y: '' },
  { x: '', y: '' }
];

// Функции рендеринга
function render() {
  pointsBody.innerHTML = '';
  
  rows.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><input data-i="${i}" data-k="x" value="${p.x}" aria-label="X${i + 1}" inputmode="decimal"></td>
      <td><input data-i="${i}" data-k="y" value="${p.y}" aria-label="Y${i + 1}" inputmode="decimal"></td>
      <td><button class="remove" data-r="${i}" aria-label="Удалить точку">×</button></td>
    `;
    pointsBody.append(tr);
  });
  
  document.querySelector('#count').textContent = `Точек: ${rows.length} / 12`;
}

function clearResults() {
  document.querySelector('#results').classList.add('hidden');
  document.querySelector('#error').textContent = '';
}

function renderSteps(results) {
  const stepsHtml = results.map(r => `
    <section class="method-steps">
      <h3>${r.name}</h3>
      ${r.data.steps.map((s, i) => `
        <div class="step">
          <h4>${i + 1}. ${s.title}</h4>
          <p>${s.text}</p>
          ${s.math ? `
            <div class="math formula-render">
              \\[${s.math.replace(/\n/g, '\\\\')}\\]
            </div>
          ` : ''}
          ${s.table ? `
            <div class="table-wrap">
              <table class="math-table">
                <thead>
                  <tr>${s.table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${s.table.rows.map(row => `
                    <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </section>
  `).join('');

  document.querySelector('#steps').innerHTML = `
    <div class="steps-grid ${results.length === 2 ? 'two-methods' : 'one-method'}">
      ${stepsHtml}
    </div>
  `;

  if (window.MathJax) {
    MathJax.typesetPromise([document.querySelector('#steps')]);
  }
}

// Обработчики событий интерфейса
document.querySelector('#clear').onclick = () => {
  rows = [{ x: '', y: '' }, { x: '', y: '' }];
  document.querySelector('#target').value = '';
  render();
  clearResults();
};

pointsBody.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.i === undefined) return;
  rows[+el.dataset.i][el.dataset.k] = el.value;
  clearResults();
});

pointsBody.addEventListener('click', e => {
  if (e.target.dataset.r === undefined) return;
  if (rows.length <= 2) {
    document.querySelector('#error').textContent = 'Нужно оставить минимум две точки.';
    return;
  }
  rows.splice(+e.target.dataset.r, 1);
  render();
  clearResults();
});

document.querySelector('#add').onclick = () => {
  if (rows.length >= 12) {
    document.querySelector('#error').textContent = 'Максимум 12 точек.';
    return;
  }
  rows.push({ x: '', y: '' });
  render();
  clearResults();
};

document.querySelector('#example').onclick = () => {
  rows = [{ x: '0', y: '1' }, { x: '1', y: '2' }, { x: '2', y: '5' }];
  document.querySelector('#target').value = '1,5';
  render();
  clearResults();
};

document.querySelector('#target').addEventListener('input', clearResults);
document.querySelector('#method').addEventListener('change', clearResults);

// Логика вычислений
document.querySelector('#calculate').onclick = () => {
  const err = document.querySelector('#error');
  err.textContent = '';

  try {
    const points = rows.map(p => ({ x: num(p.x), y: num(p.y) }));
    validate(points);
    
    const x = num(document.querySelector('#target').value);
    const method = document.querySelector('#method').value;
    const results = [];

    if (method !== 'newton') {
      results.push({ name: 'Метод Лагранжа', data: lagrange(points, x) });
    }
    if (method !== 'lagrange') {
      results.push({ name: 'Метод Ньютона', data: newton(points, x) });
    }

    // Рендеринг карточек с ответами
    document.querySelector('#answers').innerHTML = results.map(r => `
      <article class="answer-card">
        <h3>${r.name}</h3>
        <div class="muted">Значение в точке X = ${fmt(x)}</div>
        <div class="value">${fmt(r.data.value)}</div>
        <p class="answer-detail">Интерполяционный многочлен рассчитан по ${points.length} узлам.</p>
      </article>
    `).join('');

    renderSteps(results);

    // Отрисовка графика
    drawGraph(
      document.querySelector('#graph'),
      points,
      results.map(r => ({ ...r.data, name: r.name })),
      x,
      document.querySelector('#legend')
    );

    // Обновление сводки и прокрутка к результатам
    document.querySelector('#result-summary').textContent = `Узлов интерполяции: ${points.length} · X = ${fmt(x)}`;
    document.querySelector('#results').classList.remove('hidden');
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth' });

  } catch (e) {
    err.textContent = e.message;
    document.querySelector('#results').classList.add('hidden');
  }
};

// Первичная инициализация
render();