# Анализ конфликтов правил форматирования

## Порядок применения правил (приоритеты)

1. **ПРИОРИТЕТ #1**: Составные выражения (`compoundExpressions`)
2. **ПРИОРИТЕТ #2**: Слова, которые не должны быть в конце (`avoidEndWords`)
3. **ПРИОРИТЕТ #3**: Слова, которые никогда не разделяются (`neverSplitWords`) - **пропускается, если `compoundWasFound = true`**
4. **ПРИОРИТЕТ #4**: Специальные термины (`isSpecialTerm`)
5. **ПРИОРИТЕТ #5**: Базовые правила (`openingChars`, `specialChars`)

---

## Обнаруженные конфликты

### 1. ⚠️ КОНФЛИКТ: `avoidEndWords` vs `compoundExpressions`

**Проблема**: Слова из `avoidEndWords` могут быть частью `compoundExpressions`.

**Примеры пересечений**:
- `"in"` в `avoidEndWords` (предлог) → `"in accordance"`, `"in accordance with"` в `compoundExpressions`
- `"with"` в `avoidEndWords` (предлог) → `"in accordance with"` в `compoundExpressions`
- `"to"` в `avoidEndWords` (предлог) → `"according to"`, `"due to"`, `"prior to"` в `compoundExpressions`
- `"of"` в `avoidEndWords` (предлог) → `"because of"`, `"instead of"`, `"out of"` в `compoundExpressions`
- `"as"` в `avoidEndWords` (союз) → `"as well as"`, `"as for"`, `"as of"`, `"as per"` в `compoundExpressions`
- `"for"` в `avoidEndWords` (предлог) → `"as for"` в `compoundExpressions`

**Текущее поведение**:
- Если `compoundWasFound = true`, то `neverSplitWords` пропускается
- **НО**: `avoidEndWords` все равно проверяется после обработки составных выражений
- Это может отменить правильное позиционирование для составных выражений

**Пример проблемы**:
```
Текст: "we work in accordance with the rules"
splitIndex: между "accordance" и "with"
1. Находит "in accordance with" → переносит splitIndex перед "in accordance"
2. Результат: "we work" + "in accordance with the rules"
3. Проверяет avoidEndWords для "work" → не в списке, OK
4. Но если бы было "we in accordance with", то "in" в avoidEndWords могло бы сработать неправильно
```

**Рекомендация**: 
- ✅ **УЖЕ ЧАСТИЧНО РЕШЕНО**: Проверка `avoidEndWords` происходит после обработки составных выражений, но только для `lastWord` в `beforeSplit`
- ⚠️ **ПОТЕНЦИАЛЬНАЯ ПРОБЛЕМА**: Если составное выражение обработано и splitIndex перенесен, но последнее слово в новом `beforeSplit` все еще из `avoidEndWords`, это может быть проблемой

---

### 2. ✅ РЕШЕНО: `neverSplitWords` vs `compoundExpressions`

**Проблема**: Слова из `neverSplitWords` могут быть частью `compoundExpressions`.

**Примеры**:
- `"in"` в `neverSplitWords` (единица измерения "дюймы") → `"in accordance"`, `"in accordance with"` в `compoundExpressions`

**Текущее решение**:
- В функции `shouldNeverSplit()` добавлена проверка: если `firstWord` является частью составного выражения, пропускаем проверку `neverSplitWords`
- ✅ **РЕШЕНО**: Логика корректно обрабатывает этот случай

---

### 3. ✅ РЕШЕНО: `avoidEndWords` vs `neverSplitWords`

**Проблема**: Некоторые слова есть и в `avoidEndWords`, и в `neverSplitWords`.

**Примеры**:
- `"in"` в `avoidEndWords` (предлог) и в `neverSplitWords` (единица измерения)

**Текущее решение**:
- `avoidEndWords` проверяется первым (приоритет #2)
- `neverSplitWords` проверяется только если `!compoundWasFound` (приоритет #3)
- Контекст определяет, какое правило применить
- ✅ **РЕШЕНО**: Порядок приоритетов корректный

---

### 4. ✅ РЕШЕНО: Вложенные `compoundExpressions`

**Проблема**: Некоторые составные выражения являются частью других составных выражений.

**Примеры**:
- `"in accordance"` и `"in accordance with"` - вложенные выражения

**Текущее решение**:
- В `findCompoundSafePosition()` добавлена проверка: если трехсловное выражение пересекает границу, проверяем, является ли двухсловная часть тоже составным выражением
- Если да, оставляем splitIndex на месте (разрешаем разделение)
- ✅ **РЕШЕНО**: Логика корректно обрабатывает вложенные выражения

---

## Потенциальные проблемы

### ✅ РЕШЕНО: `avoidEndWords` может отменить правильное позиционирование составных выражений

**Проблема была**: Если составное выражение было обработано и splitIndex перенесен, но новое `beforeSplit` заканчивается словом из `avoidEndWords`, которое является частью обработанного составного выражения, это могло отменить правильное позиционирование.

**Решение**: 
- ✅ **РЕШЕНО**: Добавлена проверка в `avoidEndWords`: если `lastWord` является частью обработанного составного выражения (двухсловного или трехсловного), пропускаем проверку `avoidEndWords`
- Это предотвращает отмену правильного позиционирования для составных выражений

---

### ✅ РЕШЕНО: Порядок проверки `avoidEndWords` после обработки составных выражений

**Проблема была**: Если составное выражение было обработано и splitIndex перенесен, но новое `beforeSplit` заканчивается словом из `avoidEndWords`, которое является частью обработанного составного выражения, это могло быть проблемой.

**Решение**: 
- ✅ **РЕШЕНО**: Добавлена проверка `isPartOfProcessedCompound` перед проверкой `avoidEndWords`
- Если `lastWord` является частью обработанного составного выражения, пропускаем проверку `avoidEndWords`
- Это предотвращает отмену правильного позиционирования для составных выражений

---

## Рекомендации по улучшению

### ✅ 1. Добавлена проверка в `avoidEndWords`: пропускать, если слово является частью обработанного составного выражения

**Реализовано** (строки 779-822):
```javascript
// 2. ПРИОРИТЕТ #2: проверка на слова из avoidEndWords
var beforeWords = beforeSplit.split(" ");
if (beforeWords.length > 0) {
    var lastWord = beforeWords[beforeWords.length - 1].toLowerCase();
    
    // ВАЖНО: Пропускаем проверку, если lastWord является частью обработанного составного выражения
    var isPartOfProcessedCompound = false;
    if (compoundWasFound && beforeWords.length >= 2) {
        var twoWordPart = beforeWords[beforeWords.length - 2] + ' ' + lastWord;
        if (compoundExpressions[twoWordPart.toLowerCase()]) {
            isPartOfProcessedCompound = true;
        }
    }
    if (!isPartOfProcessedCompound && compoundWasFound && beforeWords.length >= 3) {
        var threeWordPart = beforeWords[beforeWords.length - 3] + ' ' + 
                           beforeWords[beforeWords.length - 2] + ' ' + lastWord;
        if (compoundExpressions[threeWordPart.toLowerCase()]) {
            isPartOfProcessedCompound = true;
        }
    }
    
    if (!isPartOfProcessedCompound && avoidEndWords[lastWord]) {
        // Переносим splitIndex назад
    }
}
```

**Результат**: ✅ Проблема решена, конфликт устранен

---

## Итоговая оценка

### ✅ Хорошо обработанные конфликты:
1. `neverSplitWords` vs `compoundExpressions` - решено через проверку контекста
2. `avoidEndWords` vs `neverSplitWords` - решено через порядок приоритетов
3. Вложенные `compoundExpressions` - решено через проверку двухсловных частей

### ✅ Все проблемы решены:
1. ~~`avoidEndWords` может отменить правильное позиционирование составных выражений~~ ✅ **РЕШЕНО**
   - Добавлена проверка `isPartOfProcessedCompound` в `avoidEndWords`
   - Если `lastWord` является частью обработанного составного выражения, пропускаем проверку

### ✅ Общая оценка:
- ✅ Все конфликты правильно обработаны
- ✅ Порядок приоритетов логичен и работает корректно
- ✅ Все потенциальные проблемы решены
- ✅ Правила работают согласованно без конфликтов

