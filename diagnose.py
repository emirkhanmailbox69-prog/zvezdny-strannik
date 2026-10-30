"""Показывает что реально в sections.json."""
import json
import re

with open('src/data/sections.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

types = {'narrative': 0, 'check': 0, 'combat': 0}
no_choices = []
with_roll = []
with_go_to = []

for s in data['sections']:
    t = s.get('type', 'narrative')
    types[t] = types.get(t, 0) + 1

    text = s.get('text', '')

    # narrative без choices и без ending — вот эти застрянут
    if t == 'narrative' and not s.get('choices') and not s.get('ending'):
        no_choices.append(s['id'])

    # есть "брось ... кубик/кости" в тексте
    if re.search(r'брос[а-я]*.*(кубик|кост)', text, re.IGNORECASE):
        has_check_type = (t == 'check' and s.get('check'))
        if not has_check_type:
            with_roll.append({
                'id': s['id'],
                'type': t,
                'has_choices': bool(s.get('choices')),
                'preview': text[:100],
            })

    # есть "иди на N" в тексте
    if re.search(r'[Ии]ди на \d+', text):
        with_go_to.append(s['id'])

print(f'📊 Типы секций: {types}')
print(f'📊 Всего: {sum(types.values())}')
print()
print(f'❌ narrative БЕЗ choices и БЕЗ ending (застрянут): {len(no_choices)}')
print(f'   {no_choices[:30]}')
print()
print(f'🎲 Содержат "брось кубик", но НЕ type=check: {len(with_roll)}')
for item in with_roll[:15]:
    print(f"  {item['id']} type={item['type']} choices={item['has_choices']}")
    print(f"    {item['preview']}…")
print()
print(f'🔀 Содержат "иди на N" в тексте: {len(with_go_to)}')
print(f'   {with_go_to[:20]}')