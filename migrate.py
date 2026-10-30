"""
Мигратор: sections/*.txt + choices.py → src/data/sections.json
Запуск: python migrate.py
"""
import os
import re
import json

SECTIONS_DIR = 'sections'
CHOICES_FILE = 'choices.py'
OUTPUT_FILE = 'src/data/sections.json'


def load_sections() -> dict[int, str]:
    sections = {}
    for fname in os.listdir(SECTIONS_DIR):
        if not fname.endswith('.txt'):
            continue
        try:
            num = int(fname.replace('.txt', ''))
        except ValueError:
            continue
        with open(os.path.join(SECTIONS_DIR, fname), 'r', encoding='utf-8') as f:
            sections[num] = f.read().strip()
    return sections


def load_choices() -> dict:
    with open(CHOICES_FILE, 'r', encoding='utf-8') as f:
        code = f.read()
    ns = {}
    exec(code, ns)
    return ns.get('choices_data', {})


def strip_go_to(text: str) -> str:
    """Убирает 'иди на XXX' и нормализует пробелы."""
    text = re.sub(r'[Ии]ди на \d+[.]?', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip(' .,;:-\n')


def detect_type(text: str) -> str:
    t = text.lower()
    if 'брось дв' in t or 'брось одн' in t or 'брось кубик' in t or 'бросай кубик' in t:
        return 'check'
    # Бой: паттерн "МАСТЕРСТВО ... ВЫНОСЛИВОСТЬ" и числа под ним
    if 'мастерство' in t and 'выносливость' in t and re.search(r'\d+\s+\d+', text):
        return 'combat'
    return 'narrative'


def detect_ending(text: str) -> str | None:
    t = text.lower()
    if 'твое путешествие окончено' in t or 'твоё путешествие окончено' in t:
        return 'death'
    if 'твое приключение окончено' in t or 'твоё приключение окончено' in t:
        return 'death'
    if 'возвращаешься на землю' in t and ('поздравля' in t or 'успех' in t):
        return 'victory'
    return None


def parse_check(text: str) -> dict | None:
    """Пытается распарсить простую проверку: 2 исхода."""
    matches = re.findall(r'[Ии]ди на (\d+)', text)
    if len(matches) != 2:
        return None
    kind = 'luck' if 'удач' in text.lower() else 'mastery'
    return {
        'kind': kind,
        'success': int(matches[0]),
        'fail': int(matches[1]),
    }


def parse_combat(text: str) -> dict | None:
    """Пытается вытащить врагов из таблицы."""
    enemies = []
    for line in text.split('\n'):
        line = line.strip()
        # "ПЕРВЫЙ ВЕПРЬ 8 16" или "ПЕРВЫЙ СТРАЖНИК 8 7"
        m = re.match(r'^([А-ЯЁ][А-ЯЁ \-]+?)\s+(\d+)\s+(\d+)$', line)
        if m:
            enemies.append({
                'name': m.group(1).strip().title(),
                'mastery': int(m.group(2)),
                'stamina': int(m.group(3)),
            })
    if not enemies:
        return None
    return {
        'kind': 'melee',
        'enemies': enemies,
        'victory': 0,
        'defeat': 'death',
    }


def main():
    print('📂 Загружаем секции...')
    sections = load_sections()
    print(f'   найдено {len(sections)}')

    print('📂 Загружаем выборы...')
    choices_data = load_choices()
    print(f'   найдено {len(choices_data)} секций с выборами')

    result = []
    needs_review: list[int] = []
    missing_choices: list[int] = []

    for num in sorted(sections.keys()):
        raw = sections[num]
        stype = detect_type(raw)
        ending = detect_ending(raw)

        section: dict = {
            'id': num,
            'type': stype,
            'text': strip_go_to(raw),
        }
        if ending:
            section['ending'] = ending

        if stype == 'narrative':
            choices = choices_data.get(num, [])
            if choices:
                section['choices'] = [
                    {'label': label, 'next': next_id}
                    for label, next_id in choices
                ]
            elif not ending:
                missing_choices.append(num)

        elif stype == 'check':
            section['_needs_review'] = True
            needs_review.append(num)
            parsed = parse_check(raw)
            if parsed:
                section['check'] = parsed

        elif stype == 'combat':
            section['_needs_review'] = True
            needs_review.append(num)
            parsed = parse_combat(raw)
            if parsed:
                section['combat'] = parsed

        result.append(section)

    os.makedirs('src/data', exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump({'sections': result}, f, ensure_ascii=False, indent=2)

    print(f'\n✅ Записано {len(result)} секций → {OUTPUT_FILE}')
    print(f'⚠️  check/combat (нужна ручная правка): {len(needs_review)}')
    print(f'   {needs_review}')
    print(f'⚠️  narrative без choices: {len(missing_choices)}')
    print(f'   {missing_choices}')


if __name__ == '__main__':
    main()