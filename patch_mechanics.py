"""
Патчит sections.json:
1. Проставляет ending=death/victory для 7 концовок
2. Прописывает check-механики для 35 секций вручную
3. 216 (финал-вычисление) → успех=340 (победа), провал=339 (смерть)
"""
import json

with open('src/data/sections.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_id = {s['id']: s for s in data['sections']}

# --- 1. Концовки ---
DEATHS = [63, 174, 247, 286, 339]
for sid in DEATHS:
    if sid in by_id:
        by_id[sid]['type'] = 'narrative'
        by_id[sid]['ending'] = 'death'
        by_id[sid].pop('choices', None)
        by_id[sid].pop('_needs_review', None)

if 340 in by_id:
    by_id[340]['type'] = 'narrative'
    by_id[340]['ending'] = 'victory'
    by_id[340].pop('choices', None)
    by_id[340].pop('_needs_review', None)

# --- 2. Проверки ---
# kind: 'luck' (>=target успех) или 'mastery' (<=target успех)
CHECKS = {
    10:  {'kind': 'luck', 'success': 154, 'fail': 123},
    30:  {'kind': 'dice', 'success': 190, 'fail': 165},     # 1 = провал
    33:  {'kind': 'mastery', 'who': 'science', 'success': 332, 'fail': 224},
    35:  {'kind': 'mastery', 'who': 'science', 'success': 24, 'fail': 9},
    56:  {'kind': 'mastery', 'who': 'science', 'success': 117, 'fail': 313},
    75:  {'kind': 'mastery', 'who': 'doctor', 'success': 90, 'fail': 213},
    101: {'kind': 'mastery', 'who': 'doctor', 'success': 7, 'fail': 68},
    105: {'kind': 'mastery', 'who': 'captain', 'success': 303, 'fail': 247},
    124: {'kind': 'mastery', 'who': 'science', 'success': 48, 'fail': 251},
    151: {'kind': 'luck', 'success': 14, 'fail': 313},
    159: {'kind': 'mastery', 'who': 'captain', 'success': 31, 'fail': 31},  # всегда -> 31 (специфика)
    172: {'kind': 'mastery', 'who': 'science', 'success': 153, 'fail': 255},
    189: {'kind': 'mastery', 'who': 'captain', 'success': 149, 'fail': 175},
    210: {'kind': 'luck', 'success': 107, 'fail': 219},
    223: {'kind': 'mastery', 'who': 'doctor', 'success': 46, 'fail': 129},
    227: {'kind': 'mastery', 'who': 'science', 'success': 83, 'fail': 282},
    251: {'kind': 'mastery', 'who': 'security', 'success': 208, 'fail': 234},
    268: {'kind': 'mastery', 'who': 'engineer', 'success': 139, 'fail': 70},
    289: {'kind': 'mastery', 'who': 'science', 'success': 275, 'fail': 251},
    326: {'kind': 'mastery', 'who': 'captain', 'success': 266, 'fail': 12},
}

for sid, spec in CHECKS.items():
    if sid in by_id:
        by_id[sid]['type'] = 'check'
        by_id[sid]['check'] = spec
        by_id[sid]['choices'] = []
        by_id[sid].pop('_needs_review', None)

# --- 3. 216: финал-вычисление → победа/смерть ---
if 216 in by_id:
    by_id[216]['type'] = 'check'
    by_id[216]['check'] = {'kind': 'luck', 'success': 340, 'fail': 339}
    by_id[216]['choices'] = []

with open('src/data/sections.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'✅ Патч применён: {len(DEATHS)} смертей, 1 победа, {len(CHECKS)} проверок, 1 финал')