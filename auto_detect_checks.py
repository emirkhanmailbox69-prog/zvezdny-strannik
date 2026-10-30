"""
Автоматически находит narrative-секции с проверками кубиков
и превращает их в type=check с правильными success/fail.

Логика:
- Ищет "брось ... кости/кубик" в тексте
- Находит два "иди на X", "иди на Y"
- Определяет kind (luck/mastery/dice) и кто бросает
- Определяет какой из двух исходов success, исходя из оператора
"""
import json
import re

SECTIONS_FILE = 'src/data/sections.json'

WHO_PATTERNS = [
    (r'Офицер[а-я]*\s+по\s+науке', 'science'),
    (r'\bВрач[а-я]*\b', 'doctor'),
    (r'Главн[а-я]*\s+Инженер[а-я]*', 'engineer'),
    (r'Начальник[а-я]*\s+безопасности', 'security'),
]


def detect_who(text: str) -> str:
    for pattern, who in WHO_PATTERNS:
        if re.search(pattern, text):
            return who
    return 'captain'


def parse_check(text: str) -> dict | None:
    """Извлекает check из текста. Возвращает None, если не проверка."""
    t = text.lower()

    # Должно быть "брось" (или "бросай") + упоминание кубиков/костей
    has_roll = bool(re.search(r'брос[а-я]*', t))
    has_dice = bool(re.search(r'(кубик|кост[а-я]*|кубик[а-я]*)', t))

    if not (has_roll and has_dice):
        return None

    # Находим все "иди на N"
    go_to = list(re.finditer(r'[Ии]ди на (\d+)', text))
    if len(go_to) < 2:
        # Одна цель — вероятно, "кубик, если 1 → X, иначе Y" в одном предложении
        # Такое оставим на ручную правку
        if len(go_to) == 1:
            return {'_needs_review': True, 'partial_target': int(go_to[0].group(1))}
        return None

    # Берём первые два (обычно это success/fail)
    m1 = go_to[0]
    m2 = go_to[1]
    n1 = int(m1.group(1))
    n2 = int(m2.group(1))

    # Определяем тип проверки
    if 'удач' in t:
        kind = 'luck'
    elif 'мастерств' in t:
        kind = 'mastery'
    else:
        kind = 'dice'

    # Определяем оператор для каждого предложения
    # Берём контекст ±200 символов до "иди на N"
    def operator_before(idx: int) -> str:
        start = max(0, idx - 200)
        ctx = text[start:idx].lower()
        # Ищем "больше или равно", "меньше или равно", "больше", "меньше"
        if 'больше или равно' in ctx or 'больше либо равно' in ctx:
            return '>='
        if 'меньше или равно' in ctx or 'меньше либо равно' in ctx:
            return '<='
        # Ищем ближайший оператор
        if re.search(r'\bбольше\b', ctx):
            return '>'
        if re.search(r'\bменьше\b', ctx):
            return '<'
        return '?'

    op1 = operator_before(m1.start())
    op2 = operator_before(m2.start())

    if kind == 'dice':
        # "Если выпадет 1" — успех = dice != 1 (или явно указано)
        # Пока не парсим автоматически, отдаём на ручную
        return {'_needs_review': True, 'n1': n1, 'n2': n2}

    # Успех для luck: оператор должен быть '>='
    # Успех для mastery: оператор должен быть '<='
    success_op = '>=' if kind == 'luck' else '<='

    if op1 == success_op:
        success, fail = n1, n2
    elif op2 == success_op:
        success, fail = n2, n1
    else:
        # Не смогли определить — отдаём на ручную
        return {'_needs_review': True, 'n1': n1, 'n2': n2, 'op1': op1, 'op2': op2}

    who = detect_who(text) if kind == 'mastery' else None

    spec = {
        'kind': kind,
        'success': success,
        'fail': fail,
    }
    if who and who != 'captain':
        spec['who'] = who

    return spec


def main():
    with open(SECTIONS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    fixed = 0
    manual = []

    for s in data['sections']:
        # Уже check — не трогаем
        if s.get('type') == 'check' and s.get('check'):
            continue

        # Уже combat — не трогаем
        if s.get('type') == 'combat' and s.get('combat'):
            continue

        # Есть ending — не трогаем (это финал)
        if s.get('ending'):
            continue

        text = s.get('text', '')
        spec = parse_check(text)

        if spec is None:
            continue

        if spec.get('_needs_review'):
            manual.append({
                'section': s['id'],
                'spec': spec,
                'preview': text[:120],
            })
            continue

        # Отлично — превращаем в check
        s['type'] = 'check'
        s['check'] = spec
        s['choices'] = []
        s.pop('_needs_review', None)
        fixed += 1

    with open(SECTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'✅ Превращено в check: {fixed}')
    print(f'⚠️  Требуют ручной правки: {len(manual)}')
    if manual:
        print()
        for item in manual:
            print(f"  секция {item['section']}: {item['spec']}")
            print(f"    {item['preview']}…")
            print()


if __name__ == '__main__':
    main()