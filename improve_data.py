"""
Чистит sections.json:
1. Убирает из текста "иди на N", пустые (), лишние знаки
2. Переписывает "Перейти на раздел N" на нормальные описания
3. Оставляет список того, что требует ручной правки
"""
import json
import re

SECTIONS_FILE = 'src/data/sections.json'


def clean_text(text: str) -> str:
    # (иди на N) → пусто
    text = re.sub(r'\s*\(\s*[Ии]ди на \d+[.]?\s*\)', '', text)
    # "иди на N" → пусто (с точкой или без)
    text = re.sub(r'[Ии]ди на \d+[.]?', '', text)
    # Пустые скобки "()", "( )"
    text = re.sub(r'\(\s*\)', '', text)
    # Пробел перед запятой/точкой
    text = re.sub(r'\s+([,.;:!?])', r'\1', text)
    # Двойные запятые/точки
    text = re.sub(r',\s*,+', ',', text)
    text = re.sub(r'\.{2,}', '.', text)
    # Множественные пробелы
    text = re.sub(r'[ \t]+', ' ', text)
    # Пробелы в начале строк
    text = re.sub(r' *\n *', '\n', text)
    # Три и больше переносов → два
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip(' .,;:-\n')


def extract_action(full_text: str, target: int) -> str | None:
    """Пытается вытащить описание действия из текста перед "иди на target"."""
    # Ищем "иди на target" и берём 200 символов до него
    m = re.search(rf'[Ии]ди на {target}\b', full_text)
    if not m:
        return None

    start = max(0, m.start() - 300)
    fragment = full_text[start:m.start()]

    # Обрезаем по концу предыдущего предложения
    for sep in ['. ', '! ', '? ', '; ']:
        idx = fragment.rfind(sep)
        if idx != -1:
            fragment = fragment[idx + len(sep):]
            break

    # Обрезаем по последнему ", или" / ", либо" / ", а затем"
    for sep_pat in [r',\s*или\s+', r',\s*либо\s+', r',\s*а\s+затем\s+']:
        parts = re.split(sep_pat, fragment, flags=re.IGNORECASE)
        if parts:
            fragment = parts[-1]

    fragment = fragment.strip(' "\'«»')

    # Убираем "Если хочешь", "Если", "то", "тебе", "можешь"
    fragment = re.sub(r'^[Ее]сли\s+хочешь,?\s*', '', fragment)
    fragment = re.sub(r'^[Ее]сли\s+', '', fragment)
    fragment = re.sub(r'^[Тт]ы\s+можешь\s+', '', fragment)
    fragment = re.sub(r'^[Тт]ебе\s+', '', fragment)
    fragment = re.sub(r'^[Мм]ожешь\s+', '', fragment)
    fragment = re.sub(r',?\s*то\s+', ' ', fragment, count=1)

    # Убираем начальные "и", "а", "или", "либо"
    fragment = re.sub(r'^(?:и|а|или|либо)\s+', '', fragment, flags=re.IGNORECASE)

    # Заглавная первая буква
    if fragment:
        fragment = fragment[0].upper() + fragment[1:]

    # Убираем хвостовые "и", "то", "чтобы"
    fragment = re.sub(r'\s+(?:и|то|чтобы|если)\s*$', '', fragment, flags=re.IGNORECASE)

    # Обрезаем до 90 символов по границе слова
    if len(fragment) > 90:
        fragment = fragment[:87]
        last_space = fragment.rfind(' ')
        if last_space > 60:
            fragment = fragment[:last_space]
        fragment += '…'

    fragment = fragment.strip(' .,;:-')
    return fragment if len(fragment) >= 4 else None


def main():
    with open(SECTIONS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    manual_review = []
    fixed_choices = 0
    cleaned_texts = 0

    for s in data['sections']:
        raw = s.get('text', '')
        cleaned = clean_text(raw)
        if cleaned != raw:
            cleaned_texts += 1
        s['text'] = cleaned

        choices = s.get('choices') or []
        if not choices:
            continue

        new_choices = []
        for ch in choices:
            label = ch.get('label', '')
            next_id = ch['next']

            is_placeholder = bool(re.match(
                r'^Перейти на (раздел|секцию)\s+\d+$', label
            ))

            if not is_placeholder:
                new_choices.append(ch)
                continue

            action = extract_action(raw, next_id)
            if action:
                new_choices.append({'label': action, 'next': next_id})
                fixed_choices += 1
            else:
                new_choices.append({'label': '…', 'next': next_id})
                manual_review.append({
                    'section': s['id'],
                    'next': next_id,
                    'text_preview': cleaned[:80],
                })

        s['choices'] = new_choices

    with open(SECTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'✅ Текстов очищено: {cleaned_texts}')
    print(f'✅ Выборов переписано: {fixed_choices}')
    print(f'⚠️  Осталось на ручную правку: {len(manual_review)}')
    if manual_review:
        print()
        print('Список (секция → куда ведёт):')
        for item in manual_review[:40]:
            print(f"  {item['section']} → {item['next']}  |  {item['text_preview']}…")


if __name__ == '__main__':
    main()