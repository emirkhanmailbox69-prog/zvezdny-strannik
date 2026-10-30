"""Финальная зачистка: софтлоки, перенаправления с правил, флаги."""
import json

with open('src/data/sections.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_id = {s['id']: s for s in data['sections']}

# 1. check без spec (5 софтлоков) → narrative с одним выбором
NARRATIVE_FIXES = {
    255: {'label': 'Продолжить', 'next': 18},
    257: {'label': 'Продолжить путь к серой планете', 'next': 109},
    274: {'label': 'Войти в башню', 'next': 91},
    306: {'label': 'Продолжить', 'next': 172},
    327: {'label': 'Отправить офицера на разведку', 'next': 47},
}

for sid, ch in NARRATIVE_FIXES.items():
    if sid in by_id:
        s = by_id[sid]
        s['type'] = 'narrative'
        s['choices'] = [ch]
        s.pop('check', None)
        s.pop('combat', None)
        s.pop('_needs_review', None)
        print(f'  ✅ {sid}: → {ch["next"]}')

# 2. Секции с _needs_review — снять флаг (они уже работают как narrative)
for sid in [95, 139, 204, 240, 248, 254, 262, 295]:
    if sid in by_id:
        by_id[sid].pop('_needs_review', None)
        print(f'  ✅ {sid}: _needs_review снят')

# 3. Секции, ведущие на правила (341/342/343) — перенаправить на продолжение
REDIRECTS = {
    58: 235,    # готовность к бою → сцена боя
    143: 185,   # отказ подчиниться ганцигам → победа над ними
    235: 133,   # перестрелка с врагом → победа
    335: 185,   # повторная встреча с ганцигами → победа
    102: 240,   # сумасшедший офицер → после драки
    54: 120,    # терриальцы → победа
    196: 152,   # падальщик → победа
    307: 241,   # выстрел в маленького чужака → попадание
}

for sid, new_next in REDIRECTS.items():
    if sid in by_id:
        s = by_id[sid]
        # если уже есть choices — заменяем только правила
        if s.get('choices'):
            s['choices'] = [
                {'label': ch['label'], 'next': new_next if ch['next'] in (341, 342, 343) else ch['next']}
                for ch in s['choices']
            ]
        else:
            s['type'] = 'narrative'
            s['choices'] = [{'label': 'Продолжить', 'next': new_next}]
        s.pop('check', None)
        s.pop('combat', None)
        print(f'  ✅ {sid}: → {new_next}')

with open('src/data/sections.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('\n✅ Все правки применены')