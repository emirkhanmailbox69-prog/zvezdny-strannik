"""Прописывает CombatSpec в боевые секции и чинит спец-секции."""
import json

with open('src/data/sections.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_id = {s['id']: s for s in data['sections']}

def set_combat(sid, spec):
    if sid not in by_id:
        return
    s = by_id[sid]
    s['type'] = 'combat'
    s['combat'] = spec
    s['choices'] = []
    s.pop('_needs_review', None)

# === Бои ===
set_combat(22, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Первый вепрь', 'mastery': 8, 'stamina': 16},
        {'name': 'Второй вепрь', 'mastery': 7, 'stamina': 18},
        {'name': 'Третий вепрь', 'mastery': 8, 'stamina': 18},
    ],
    'victory': 311,
    'defeat': 'death',
})

set_combat(43, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Первый стражник', 'mastery': 8, 'stamina': 7},
        {'name': 'Второй стражник', 'mastery': 7, 'stamina': 7},
        {'name': 'Третий стражник', 'mastery': 8, 'stamina': 7},
    ],
    'victory': 301,
    'defeat': 'death',
    'canSurrender': True,
    'surrender': 239,
})

set_combat(49, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Дар-виланский стражник', 'mastery': 11, 'stamina': 14},
    ],
    'victory': 147,
    'defeat': 'death',
    'canSurrender': True,
    'surrender': 309,
})

set_combat(65, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Посетитель бара', 'mastery': 7, 'stamina': 6},
        {'name': 'Второй посетитель', 'mastery': 7, 'stamina': 6},
        {'name': 'Третий посетитель', 'mastery': 7, 'stamina': 6},
    ],
    'victory': 242,
    'defeat': 'death',
})

set_combat(103, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Безумный офицер', 'mastery': 10, 'stamina': 12},
    ],
    'victory': 240,
    'defeat': 'death',
})

set_combat(135, {
    'kind': 'space',
    'enemies': [
        {'name': 'Имперский звездолёт', 'mastery': 0, 'stamina': 12, 'weapon': 9, 'defense': 12},
    ],
    'victory': 16,
    'defeat': 'death',
})

set_combat(178, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Первый техник', 'mastery': 7, 'stamina': 7},
        {'name': 'Второй техник', 'mastery': 5, 'stamina': 6},
        {'name': 'Третий техник', 'mastery': 6, 'stamina': 6},
    ],
    'victory': 205,
    'defeat': 271,
})

set_combat(208, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Первый стражник', 'mastery': 6, 'stamina': 7},
        {'name': 'Второй стражник', 'mastery': 7, 'stamina': 6},
    ],
    'victory': 48,
    'defeat': 'death',
    'canSurrender': True,
    'surrender': 234,
})

set_combat(239, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Робот-Убийца', 'mastery': 10, 'stamina': 4},
    ],
    'victory': 72,
    'defeat': 'death',
})

set_combat(245, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Ганцигский офицер', 'mastery': 8, 'stamina': 10},
    ],
    'victory': 188,
    'defeat': 'death',
})

set_combat(297, {
    'kind': 'melee',
    'enemies': [
        {'name': 'Стражник Кулимата', 'mastery': 11, 'stamina': 14},
    ],
    'victory': 160,
    'defeat': 'death',
    'canSurrender': True,
    'surrender': 215,
})

# === Перестрелки ===
set_combat(61, {
    'kind': 'blaster',
    'enemies': [
        {'name': 'Стражник', 'mastery': 7, 'stamina': 1},
    ],
    'victory': 244,
    'defeat': 237,
})

set_combat(122, {
    'kind': 'blaster',
    'enemies': [
        {'name': 'Первый малинианин', 'mastery': 8, 'stamina': 1},
        {'name': 'Второй малинианин', 'mastery': 7, 'stamina': 1},
        {'name': 'Третий малинианин', 'mastery': 9, 'stamina': 1},
    ],
    'victory': 225,
    'defeat': 'death',
    'canSurrender': True,
    'surrender': 37,
})

set_combat(131, {
    'kind': 'blaster',
    'enemies': [
        {'name': 'Первый стражник', 'mastery': 7, 'stamina': 1},
        {'name': 'Второй стражник', 'mastery': 6, 'stamina': 1},
        {'name': 'Третий стражник', 'mastery': 7, 'stamina': 1},
    ],
    'victory': 91,
    'defeat': 'death',
})

set_combat(298, {
    'kind': 'blaster',
    'enemies': [
        {'name': 'Луфф', 'mastery': 8, 'stamina': 1},
        {'name': 'Первый техник', 'mastery': 7, 'stamina': 1},
        {'name': 'Второй техник', 'mastery': 6, 'stamina': 1},
        {'name': 'Третий техник', 'mastery': 7, 'stamina': 1},
    ],
    'victory': 120,
    'defeat': 'death',
})

# === Спец-секции (правила боя, не вызываются напрямую) ===
# Превращаем в narrative с "Далее", чтобы игрок не застрял
for sid, nxt in [(58, 341), (128, 75), (183, 72), (201, 172), (206, 317)]:
    if sid in by_id:
        s = by_id[sid]
        s['type'] = 'narrative'
        s['choices'] = [{'label': 'Далее', 'next': nxt}]
        s.pop('_needs_review', None)
        s.pop('combat', None)
        s.pop('check', None)

# 179, 184 - специфика броса кубиков для отряда
if 179 in by_id:
    by_id[179]['type'] = 'narrative'
    by_id[179]['choices'] = [{'label': 'Далее', 'next': 115}]
    by_id[179].pop('_needs_review', None)
    by_id[179].pop('check', None)

if 184 in by_id:
    by_id[184]['type'] = 'narrative'
    by_id[184]['choices'] = [{'label': 'Далее', 'next': 71}]
    by_id[184].pop('_needs_review', None)
    by_id[184].pop('check', None)

# 328 - смерть от монстра
if 328 in by_id:
    by_id[328]['type'] = 'narrative'
    by_id[328]['ending'] = 'death'
    by_id[328].pop('choices', None)

with open('src/data/sections.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('✅ Боёв прописано: 14')
print('✅ Перестрелок: 4')
print('✅ Спец-секций починено: 8')