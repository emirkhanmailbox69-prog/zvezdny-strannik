"""
Полный аудит: находит ВСЕ потенциальные софтлоки.
Не чинит — только показывает что не так.
"""
import json

with open('src/data/sections.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_id = {s['id']: s for s in data['sections']}
valid_ids = set(by_id.keys())

problems = []

def ok(n):
    return n == 0 or n in valid_ids

# Собираем все ID, куда ведут ссылки
all_targets = set()
for s in data['sections']:
    if s.get('choices'):
        for ch in s['choices']:
            all_targets.add(ch['next'])

for s in data['sections']:
    sid = s['id']
    stype = s.get('type', 'narrative')

    # narrative без choices и без ending
    if stype == 'narrative' and not s.get('choices') and not s.get('ending'):
        problems.append(f"  🔴 {sid}: narrative БЕЗ choices, БЕЗ ending  ⚠️ СОФТЛОК")
        continue

    # check без spec
    if stype == 'check' and not s.get('check'):
        problems.append(f"  🔴 {sid}: type=check, но НЕТ spec  ⚠️ СОФТЛОК")
        continue

    # combat без spec
    if stype == 'combat' and not s.get('combat'):
        problems.append(f"  🔴 {sid}: type=combat, но НЕТ spec  ⚠️ СОФТЛОК")
        continue

    # choices с битыми target
    if s.get('choices'):
        for i, ch in enumerate(s['choices']):
            if not ok(ch['next']):
                problems.append(f"  🟡 {sid}: choice #{i+1} → {ch['next']} НЕ СУЩЕСТВУЕТ")

    # check с битыми target
    if s.get('check'):
        c = s['check']
        for field in ('success', 'fail'):
            if field in c and not ok(c[field]):
                problems.append(f"  🟡 {sid}: check.{field}={c[field]} НЕ СУЩЕСТВУЕТ")

    # combat с битыми target
    if s.get('combat'):
        c = s['combat']
        if 'victory' in c and not ok(c['victory']):
            problems.append(f"  🟡 {sid}: combat.victory={c['victory']} НЕ СУЩЕСТВУЕТ")
        d = c.get('defeat')
        if isinstance(d, int) and d != 0 and not ok(d):
            problems.append(f"  🟡 {sid}: combat.defeat={d} НЕ СУЩЕСТВУЕТ")
        if 'surrender' in c and not ok(c['surrender']):
            problems.append(f"  🟡 {sid}: combat.surrender={c['surrender']} НЕ СУЩЕСТВУЕТ")

    # _needs_review
    if s.get('_needs_review'):
        problems.append(f"  🟠 {sid}: помечен _needs_review")

# Секции 341/342/343 (правила) — кто на них ссылается?
for page in (341, 342, 343):
    incoming = []
    for s in data['sections']:
        if s.get('choices'):
            for ch in s['choices']:
                if ch['next'] == page:
                    incoming.append(s['id'])
    if incoming:
        problems.append(f"  🔵 секция {page} (правила): в неё ведут {incoming} — надо заменить")

print(f"📊 Всего секций: {len(data['sections'])}")
print(f"📊 Проблем найдено: {len(problems)}\n")
for p in problems:
    print(p)

# Секции, на которые никто не ссылается (кроме старта)
orphans = valid_ids - all_targets - {1}
if orphans:
    print(f"\n📊 Осиротевшие (никто не ведёт): {sorted(orphans)}")