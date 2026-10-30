"""
Чистит sections.json v3:
- Ловит placeholder'ы: "Перейти на раздел N", "…", "Выбор 1/2/3", пустые
- Извлекает действие из текста ДО очистки (из копии)
- Если не находит — ставит осмысленный fallback
"""
import json
import re

SECTIONS_FILE = 'src/data/sections.json'


def clean_text(text: str) -> str:
    text = re.sub(r'\(\s*[Ии]ди на \d+[^)]*\)', '', text)
    text = re.sub(r'[Ии]ди на \d+[.]?', '', text)
    text = re.sub(r'\(\s*\)', '', text)
    text = re.sub(r'\s+([,.;:!?])', r'\1', text)
    text = re.sub(r',\s*,+', ',', text)
    text = re.sub(r'\.{2,}', '.', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r' *\n *', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r',\s*\.', '.', text)
    return text.strip(' .,;:-\n')


def is_placeholder(label: str) -> bool:
    if not label or label.strip() in ('', '…', '...', '.'):
        return True
    if re.match(r'^(Перейти на (раздел|секцию)\s+\d+|Выбор\s+\d+|Вариант\s+\d+)$', label.strip()):
        return True
    return False


def extract_action(full_text: str, target: int) -> str | None:
    m = re.search(rf'[Ии]ди на {target}\b', full_text)
    if not m:
        return None

    before = full_text[:m.start()]
    lookback = before[-500:] if len(before) > 500 else before

    if_matches = list(re.finditer(r'[Ее]сли\b', lookback))
    if if_matches:
        before = lookback[if_matches[-1].start():]
    else:
        for sep in ['\n', '. ', '! ', '? ']:
            idx = before.rfind(sep)
            if idx != -1:
                before = before[idx + len(sep):]
                break

    before = re.sub(r'[Ии]ди на \d+[.]?', '', before).strip()
    before = before.rstrip(' ,;:')

    # Убираем вводные
    before = re.sub(r'^[Ее]сли\s+(?:ты\s+)?(?:хочешь|решишь|решишься|пожелаешь)?\s*', '', before)
    before = re.sub(r'^[Ее]сли\s+', '', before)
    before = re.sub(r'^[Тт]ы\s+(?:можешь|решишь|хочешь)\s+', '', before)
    before = re.sub(r'^[Тт]ебе\s+(?:придется|стоит|нужно)\s+', '', before)
    before = re.sub(r'^[Мм]ожешь\s+', '', before)
    before = re.sub(r'^[Вв]ы\s+(?:можете|решите)\s+', '', before)
    before = re.sub(r',?\s*то\s+', ' ', before, count=1)
    before = re.sub(r'^(?:[Ии]|[Аа]|или|либо)\s+', '', before)

    if before:
        before = before[0].upper() + before[1:]

    before = re.sub(r'\s+(?:и|то|чтобы)\s*$', '', before, flags=re.IGNORECASE)
    before = before.strip(' .,;:')

    if len(before) < 4:
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
    fixed = 0
    kept = 0
    texts_cleaned = 0

    for s in data['sections']:
        raw_before = s.get('text', '')  # может быть уже очищен — не страшно
        # Дополнительная очистка
        new_text = clean_text(raw_before)
        if new_text != raw_before:
            texts_cleaned += 1
        s['text'] = new_text

        choices = s.get('choices') or []
        if not choices:
            continue

        placeholders_count = sum(1 for ch in choices if is_placeholder(ch.get('label', '')))

        # Если ни одного placeholder — не трогаем
        if placeholders_count == 0:
            kept += 1
            continue

        # Если единственный выбор и он placeholder → "Далее"
        if len(choices) == 1 and placeholders_count == 1:
            s['choices'] = [{'label': 'Далее', 'next': choices[0]['next']}]
            fixed += 1
            continue

        # Множественные — парсим каждый
        new_choices = []
        for i, ch in enumerate(choices):
            label = ch.get('label', '')
            nxt = ch['next']

            if not is_placeholder(label):
                new_choices.append({'label': label, 'next': nxt})
                continue

            action = extract_action(raw_before, nxt)
            if action:
                new_choices.append({'label': action, 'next': nxt})
                fixed += 1
            else:
                # Fallback: на основе позиции
                fallback = f'Вариант {i + 1}'
                new_choices.append({'label': fallback, 'next': nxt})
                manual.append({
                    'section': s['id'],
                    'next': nxt,
                    'preview': new_text[-120:] if len(new_text) > 120 else new_text,
                })

        s['choices'] = new_choices

    with open(SECTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'✅ Текстов дочищено: {texts_cleaned}')
    print(f'✅ Выборов исправлено: {fixed}')
    print(f'ℹ️  Секций с готовыми выборами (не трогали): {kept}')
    print(f'⚠️  На ручную правку: {len(manual)}')
    if manual:
        print()
        for item in manual:
            print(f"  секция {item['section']} → {item['next']}")
            print(f"    контекст: ...{item['preview']}")
            print()


if __name__ == '__main__':
    main()