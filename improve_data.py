"""
Чистит sections.json v2:
- Одиночные переходы → "Далее"
- Множественные → вытаскивает действие из "Если...иди на N"
- Агрессивнее чистит скобки
"""
import json
import re

SECTIONS_FILE = 'src/data/sections.json'


def clean_text(text: str) -> str:
    # (иди на N) или (иди на N, ...) → пусто
    text = re.sub(r'\(\s*[Ии]ди на \d+[^)]*\)', '', text)
    # (Иди на N)
    text = re.sub(r'\(\s*[Ии]ди на \d+[^)]*\)', '', text)
    # Голые "иди на N"
    text = re.sub(r'[Ии]ди на \d+[.]?', '', text)
    # Пустые скобки
    text = re.sub(r'\(\s*\)', '', text)
    # Пробел перед знаком препинания
    text = re.sub(r'\s+([,.;:!?])', r'\1', text)
    # Двойные запятые/точки
    text = re.sub(r',\s*,+', ',', text)
    text = re.sub(r'\.{2,}', '.', text)
    # Множественные пробелы и пустые строки
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r' *\n *', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Запятая перед точкой
    text = re.sub(r',\s*\.', '.', text)
    return text.strip(' .,;:-\n')


def extract_action(full_text: str, target: int) -> str | None:
    m = re.search(rf'[Ии]ди на {target}\b', full_text)
    if not m:
        return None

    before = full_text[:m.start()]

    # Ищем последнее "Если" в 400 символах до "иди на"
    lookback = before[-400:] if len(before) > 400 else before
    if_matches = list(re.finditer(r'[Ее]сли\b', lookback))
    if if_matches:
        before = lookback[if_matches[-1].start():]
    else:
        # Нет "Если" — берём от последнего ". " / "\n"
        for sep in ['\n', '. ', '! ', '? ']:
            idx = before.rfind(sep)
            if idx != -1:
                before = before[idx + len(sep):]
                break
        else:
            # Ничего не нашли — берём целиком (обрежется в конце)
            pass

    # Убираем остатки "иди на N"
    before = re.sub(r'[Ии]ди на \d+[.]?', '', before).strip()
    before = before.rstrip(' ,;:')

    # Убираем "Если хочешь/решишь/", "то"
    before = re.sub(r'^[Ее]сли\s+(?:ты\s+)?(?:хочешь|решишь|решишься)?\s*', '', before)
    before = re.sub(r',?\s*то\s+', ' ', before, count=1)

    # Убираем начальное "и", "а", "или", "либо"
    before = re.sub(r'^(?:[Ии]|[Аа]|или|либо)\s+', '', before)

    # Заглавная первая
    if before:
        before = before[0].upper() + before[1:]

    # Хвостовое "и", "то", "чтобы"
    before = re.sub(r'\s+(?:и|то|чтобы)\s*$', '', before, flags=re.IGNORECASE)

    before = before.strip(' .,;:')

    if len(before) < 5:
        return None
    if len(before) > 100:
        before = before[:97]
        last_space = before.rfind(' ')
        if last_space > 60:
            before = before[:last_space]
        before += '…'

    return before.strip(' .,;:')


def main():
    with open(SECTIONS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    manual = []
    single_auto = 0
    multi_auto = 0
    cleaned = 0

    for s in data['sections']:
        raw = s.get('text', '')
        cleaned_text = clean_text(raw)
        if cleaned_text != raw:
            cleaned += 1
        s['text'] = cleaned_text

        choices = s.get('choices') or []
        if not choices:
            continue

        # Проверяем, все ли placeholder
        all_placeholder = all(
            re.match(r'^Перейти на (раздел|секцию)\s+\d+$', ch.get('label', ''))
            for ch in choices
        )

        # Одиночный placeholder → "Далее"
        if len(choices) == 1 and all_placeholder:
            ch = choices[0]
            s['choices'] = [{'label': 'Далее', 'next': ch['next']}]
            single_auto += 1
            continue

        if not all_placeholder:
            continue  # уже размечено руками

        # Множественные → парсим
        new_choices = []
        for ch in choices:
            action = extract_action(raw, ch['next'])
            if action:
                new_choices.append({'label': action, 'next': ch['next']})
                multi_auto += 1
            else:
                new_choices.append({'label': f'Выбор {len(new_choices)+1}', 'next': ch['next']})
                manual.append({
                    'section': s['id'],
                    'next': ch['next'],
                    'preview': cleaned_text[-100:] if len(cleaned_text) > 100 else cleaned_text,
                })
        s['choices'] = new_choices

    with open(SECTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'✅ Текстов очищено: {cleaned}')
    print(f'✅ Одиночных → "Далее": {single_auto}')
    print(f'✅ Множественных → переписано: {multi_auto}')
    print(f'⚠️  Осталось непонятных: {len(manual)}')
    if manual:
        print()
        for item in manual[:30]:
            print(f"  секция {item['section']} → {item['next']}")
            print(f"    конец текста: ...{item['preview']}")


if __name__ == '__main__':
    main()