// Преобразование строки в число с базовой валидацией
export function num(value) {
  const raw = String(value ?? '').trim();
  
  if (!raw) {
    throw new Error('Заполните все поля с числами.');
  }

  const normalized = raw.replace(',', '.');
  
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized)) {
    throw new Error('Проверьте формат введённых чисел.');
  }

  const n = Number(normalized);
  
  if (!Number.isFinite(n)) {
    throw new Error('Число должно быть конечным.');
  }

  return n;
}

// Форматирование числа для отображения (округление и замена точки на запятую)
export function fmt(n) {
  // Устранение артефактов плавающей точки (например, -0.000000000001)
  if (Math.abs(n) < 1e-12) {
    n = 0;
  }
  
  return Number(n.toFixed(8)).toString().replace('.', ',');
}

// Валидация массива точек интерполяции
export function validate(points) {
  if (points.length < 2) {
    throw new Error('Нужно минимум две точки.');
  }
  
  if (points.length > 12) {
    throw new Error('Максимум 12 точек.');
  }

  points.forEach((p, i) => {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      throw new Error('Координаты точек должны быть числами.');
    }
    
    // Проверка уникальности узлов X с учетом машинной погрешности
    const isDuplicate = points.slice(0, i).some(q => Math.abs(q.x - p.x) < 1e-12);
    
    if (isDuplicate) {
      throw new Error('Значения X должны быть уникальными. Найдены повторяющиеся узлы.');
    }
  });
}