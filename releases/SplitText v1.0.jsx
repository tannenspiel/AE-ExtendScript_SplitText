// Создаем интерфейс с кнопкой для разделения текста
var win = new Window("palette", "Split Text v1.1");

// Панель для кнопок
var buttonsPanel = win.add("panel", undefined, "Actions");
buttonsPanel.alignment = "fill";
buttonsPanel.orientation = "column"; // Вертикальное расположение кнопок

// Кнопки с увеличенными размерами (в 1.5 раза больше стандартных)
// Стандартная кнопка ~150x20, увеличиваем в 1.5 раза = 225x30
var buttonWidth = 225;
var buttonHeight = 30;

var btnSplit = buttonsPanel.add("button", undefined, "Split into Layers");
btnSplit.preferredSize = [buttonWidth, buttonHeight];
btnSplit.alignment = "fill"; // Заполняет всю ширину панели
btnSplit.helpTip = "Split text into two separate layers. Position the timeline cursor where you want the split to occur.";

var btnSplitInLayer = buttonsPanel.add("button", undefined, "Split into Lines");
btnSplitInLayer.preferredSize = [buttonWidth, buttonHeight];
btnSplitInLayer.alignment = "fill"; // Заполняет всю ширину панели
btnSplitInLayer.helpTip = "Split text into two lines within the same layer. This breaks a long line into two shorter lines without creating separate layers.";

// Панель для чекбоксов
var optionsPanel = win.add("panel", undefined, "Options");
optionsPanel.alignment = "fill";
optionsPanel.orientation = "column"; // Вертикальное расположение чекбоксов

// Чекбокс для использования символа разделения
var useSplitSymbolCheckbox = optionsPanel.add("checkbox", undefined, "Use Split Symbol");
useSplitSymbolCheckbox.alignment = "left";
useSplitSymbolCheckbox.value = false;
useSplitSymbolCheckbox.helpTip = "Place the specified symbol (or any symbol you prefer) in the text where you want the split to occur.";

var splitByMidCheckbox = optionsPanel.add("checkbox", undefined, "Split at Layer Middle");
splitByMidCheckbox.alignment = "left";
splitByMidCheckbox.value = false;
splitByMidCheckbox.helpTip = "Automatically split the text at the middle point of the layer's duration. No need to manually position the timeline cursor.";

// Поле для ввода символа разделения (внутри панели Options)
var symbolLabel = optionsPanel.add("statictext", undefined, "Split Symbol:");
var splitSymbolInput = optionsPanel.add("edittext", undefined, "$");
splitSymbolInput.characters = 5;
splitSymbolInput.alignment = "fill";

// Панель для переименования и нумерации
var renamePanel = win.add("panel", undefined, "Rename and Number Layers");
renamePanel.alignment = "fill";
renamePanel.orientation = "column";
renamePanel.margins = [10, 20, 10, 10]; // Увеличиваем верхний отступ для названия панели

// Поле для ввода маски имени
var nameMaskLabel = renamePanel.add("statictext", undefined, "Name Mask:");
nameMaskLabel.alignment = "left";
var nameMaskInput = renamePanel.add("edittext", undefined, "Text");
nameMaskInput.preferredSize = [buttonWidth, 22]; // Та же ширина, что и у кнопки
nameMaskInput.alignment = "fill";
nameMaskInput.helpTip = "Enter name mask. Use {num} for 4-digit number (e.g., 'Text {num}' will create 'Text 0001', 'Text 0002', etc.)";

// Кнопка для переименования и нумерации
var btnRename = renamePanel.add("button", undefined, "Rename & Number Layers");
btnRename.preferredSize = [buttonWidth, buttonHeight];
btnRename.alignment = "fill";
btnRename.helpTip = "Rename and number all selected layers (text and non-text). Layers are sorted by inPoint (earlier = lower index).";

// Подвал с контактной информацией
var footerLabel = win.add("statictext", undefined, "tannenspiel@gmail.com");
footerLabel.alignment = "center";
footerLabel.graphics.font = ScriptUI.newFont(footerLabel.graphics.font.name, ScriptUI.FontStyle.REGULAR, 9);

// Список предлогов, союзов и других слов, которые не должны быть в конце строки
var avoidEndWords = [
    // ==================== РУССКИЙ ====================
    // Местоимения и частицы
    "и", "а", "но", "или", "да", "то", "по", "к", "с", "о", "у", "в", "на", "за", "от", "до", 
    "об", "из", "над", "под", "при", "про", "без", "для", "же", "ли", "бы", "не", "ни", "уж", 
    "во", "со", "изо", "ко", "обо", "подо", "передо", "что", "как", "чтоб", "чтобы", "кабы",
    
    // Краткие формы и местоимения
    "я", "ты", "он", "она", "оно", "мы", "вы", "они", "меня", "тебя", "его", "её", "их",
    "мне", "тебе", "ему", "ей", "нам", "вам", "им", "мной", "тобой", "им", "ей", "нами", "вами", "ими",
    
    // Притяжательные
    "мой", "твой", "его", "её", "наш", "ваш", "их", "свой",
    "моя", "твоя", "наша", "ваша", "моё", "твоё", "наше", "ваше",
    "мои", "твои", "наши", "ваши",
    
    // Указательные
    "этот", "эта", "это", "эти", "тот", "та", "то", "те", "такой", "такая", "такое", "такие",
    "сей", "сия", "сие", "сии",
    
    // Определительные
    "весь", "вся", "всё", "все", "сам", "сама", "само", "сами", "самый", "самая", "самое", "самые",
    "каждый", "каждая", "каждое", "каждые", "любой", "любая", "любое", "любые",
    
    // Наречия и частицы
    "уже", "еще", "тут", "там", "здесь", "вот", "вон", "как", "так", "прямо", "точно", "едва",
    "чуть", "почти", "совсем", "вполне", "очень", "слишком", "вряд", "лишь", "только", "либо",
    
    // Предлоги (расширенно)
    "в", "во", "на", "над", "под", "перед", "пред", "при", "после", "между", "среди", "вокруг",
    "возле", "около", "у", "от", "из", "изо", "до", "для", "ради", "через", "сквозь", "по",
    "со", "ко", "об", "обо", "про", "без", "bes", "вне", "сверх",
    
    // ==================== АНГЛИЙСКИЙ ====================
    // Articles
    "a", "an", "the",
    
    // Pronouns
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "her", "its", "our", "their", "mine", "yours", "hers", "ours", "theirs",
    "this", "that", "these", "those",
    
    // Prepositions (complete list)
    "aboard", "about", "above", "across", "after", "against", "along", "amid", "among", "around",
    "as", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "but",
    "by", "concerning", "considering", "despite", "down", "during", "except", "for", "from",
    "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over",
    "past", "regarding", "round", "since", "through", "throughout", "till", "to", "toward",
    "under", "underneath", "until", "unto", "up", "upon", "with", "within", "without",
    
    // Conjunctions
    "and", "but", "or", "nor", "for", "yet", "so", "although", "because", "since", "unless",
    "while", "whereas", "though", "even", "if", "only", "whether", "than", "rather", "soon",
    
    // Auxiliary verbs
    "am", "is", "are", "was", "were", "be", "being", "been", "have", "has", "had", "do", "does",
    "did", "will", "would", "shall", "should", "may", "might", "must", "can", "could",
    
    // Adverbs
    "very", "quite", "rather", "somewhat", "too", "enough", "just", "only", "also", "well",
    "even", "back", "still", "almost", "about", "around", "now", "then", "here", "there",
    "always", "never", "sometimes", "usually", "often", "seldom", "rarely",
    "already", "yet", "soon", "later", "early", "fast", "slow", "hard", "soft",
    
    // Quantifiers
    "all", "some", "any", "each", "every", "either", "neither", "both", "such", "what", "which",
    "who", "whom", "whose", "more", "most", "less", "least", "few", "many", "much", "several",
    
    // Question words
    "how", "when", "where", "why", "who", "whom", "whose", "which", "what",
    
    // Other important short words
    "not", "no", "yes", "ok", "okay", "please", "thank", "thanks", "sorry", "hello", "hi", "hey",
    "oh", "ah", "well", "now", "so", "thus", "hence", "therefore", "however", "moreover",
    "furthermore", "nevertheless", "nonetheless", "accordingly", "consequently"
];

// Слова, которые НИКОГДА не следует разделять
var neverSplitWords = [
    // Русские
    "и т.д.", "и т.п.", "т.е.", "т.к.", "т.н.", "н.э.", "до н.э.", "см.", "стр.", "рис.", 
    "др.", "проф.", "акад.", "им.", "ст.", "гл.", "разд.", "пар.", "п.", "с.", "г.",
    
    // Английские
    "etc.", "e.g.", "i.e.", "vs.", "etc", "eg", "ie", "vs", "fig.", "page", "pp.", "chap.",
    "sec.", "para.", "art.", "no.", "vol.", "ed.", "dept.", "univ.", "assoc.", "inc.",
    "ltd.", "co.", "corp.", "mr.", "mrs.", "ms.", "dr.", "prof.", "rev.", "hon.",
    
    // Числа и единицы измерения
    "kg", "g", "mg", "lb", "oz", "km", "m", "cm", "mm", "mi", "yd", "ft", "in",
    "l", "ml", "gal", "qt", "pt", "sec", "min", "hr", "h", "m", "s"
];

// Составные выражения, которые должны оставаться вместе
var compoundExpressions = {
    // Русские
    "так же": true, "так как": true, "потому что": true, "для того чтобы": true,
    "несмотря на": true, "в связи с": true, "в соответствии с": true, "по отношению к": true,
    "в отличие от": true, "наряду с": true, "в результате": true, "в течение": true,
    "в рамках": true, "на основе": true, "в целях": true, "в случае": true,
    
    // Английские  
    "even though": true, "as though": true, "as if": true, "as well as": true,
    "in order to": true, "so that": true, "such that": true, "rather than": true,
    "other than": true, "according to": true, "because of": true, "due to": true,
    "instead of": true, "out of": true, "up to": true, "as to": true,
    "as for": true, "as of": true, "as per": true, "in terms of": true,
    "with regard to": true, "in regard to": true, "in relation to": true,
    "in accordance with": true, "in compliance with": true, "in addition to": true,
    "prior to": true, "subsequent to": true, "thanks to": true, "contrary to": true
};

// Список символов, которые считаются открывающими (например, кавычки, скобки)
var openingChars = ['"', "'", "(", "[", "{", "«"];

// Список символов, которые должны перенести позицию на следующий пробел
var specialChars = [",", ".", "!", "?", ":", ";"];

// ============================================================================
// ВАЛИДАЦИЯ: Проверка выбора текстового слоя
// ============================================================================
function validateSelection() {
    if (!app.project || !app.project.activeItem) {
        alert("Откройте композицию.");
        return null;
    }
    
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Активный элемент не является композицией.");
        return null;
    }
    
    if (comp.selectedLayers.length === 0) {
        alert("Пожалуйста, выберите хотя бы один текстовый слой.");
        return null;
    }
    
    // Фильтруем только текстовые слои
    var textLayers = [];
    for (var i = 0; i < comp.selectedLayers.length; i++) {
        var layer = comp.selectedLayers[i];
        if (layer instanceof TextLayer) {
            var text = layer.text.sourceText.value.text;
            if (text && text.length > 0) {
                textLayers.push({ layer: layer, text: text });
            }
        }
    }
    
    if (textLayers.length === 0) {
        alert("Выбранные слои не являются текстовыми или пусты.");
        return null;
    }
    
    return { comp: comp, layers: textLayers };
}

// ============================================================================
// ПОИСК ПЕРЕНОСОВ: Улучшенная функция поиска переносов строк
// ============================================================================
function findLineBreak(text) {
    // Проверяем разные типы переносов строк (приоритет: \r\n, \r, \n)
    var crlfIndex = text.indexOf("\r\n");
    if (crlfIndex !== -1) return { position: crlfIndex, length: 2 };
    
    var crIndex = text.indexOf("\r");
    if (crIndex !== -1) return { position: crIndex, length: 1 };
    
    var lfIndex = text.indexOf("\n");
    if (lfIndex !== -1) return { position: lfIndex, length: 1 };
    
    return null;
}

// ============================================================================
// ОСНОВНАЯ ЛОГИКА РАЗДЕЛЕНИЯ
// ============================================================================
function calculateSplitPosition(text, checkLineBreak) {
    // 1. Приоритет: переносы строк (только для Split Text, не для Split in Layer)
    if (checkLineBreak) {
        var lineBreak = findLineBreak(text);
        if (lineBreak) return { position: lineBreak.position, length: lineBreak.length };
    }
    
    // 2. Символ разделения (если чекбокс активен)
    if (useSplitSymbolCheckbox.value) {
        var splitSymbol = splitSymbolInput.text;
        if (!splitSymbol || splitSymbol.length === 0) {
            alert("Введите символ разделения.");
            return null;
        }
        var position = text.indexOf(splitSymbol);
        if (position === -1) {
            alert("Символ разделения не найден в тексте.");
            return null;
        }
        return { position: position, length: splitSymbol.length };
    }
    
    // 3. Автоматический поиск пробела
    var middleIndex = Math.floor(text.length / 2);
    var splitIndex = findSplitPosition(text, middleIndex);
    if (splitIndex === -1) {
        alert("Не удалось найти подходящий пробел для разделения.");
        return null;
    }
    return { position: splitIndex, length: 1 };
}

// ============================================================================
// ОБРАБОТЧИКИ КНОПОК
// ============================================================================
function handleSplit(createNewLayers) {
    var validated = validateSelection();
    if (!validated) return;
    
    // Временно отключаем кнопку для визуальной обратной связи
    var button = createNewLayers ? btnSplit : btnSplitInLayer;
    var originalText = button.text;
    button.text = "Processing...";
    button.enabled = false;
    
    app.beginUndoGroup(createNewLayers ? "Split into Layers" : "Split into Lines");
    
    var success = false;
    try {
        // Обрабатываем все выбранные слои
        for (var i = 0; i < validated.layers.length; i++) {
            var layerData = validated.layers[i];
            var layer = layerData.layer;
            var text = layerData.text;
            
            if (createNewLayers) {
                // Для Split Text проверяем переносы строк
                var splitInfo = calculateSplitPosition(text, true);
                if (splitInfo) {
                    // Для множественного выбора всегда используем середину слоя
                    if (validated.layers.length > 1) {
                        var middleTime = layer.inPoint + (layer.outPoint - layer.inPoint) * 0.5;
                        validated.comp.time = middleTime;
                        // Пересчитываем splitInfo с учетом новой позиции времени
                        // Но для текста используем середину текста
                        var middleTextIndex = Math.floor(text.length / 2);
                        var textSplitIndex = findSplitPosition(text, middleTextIndex);
                        if (textSplitIndex !== -1) {
                            splitInfo = { position: textSplitIndex, length: 1 };
                        }
                    }
                    createSplitLayers(validated.comp, layer, text, splitInfo);
                    success = true;
                }
            } else {
                // Для Split in Layer вычисляем splitInfo только если нет переносов строк
                // Если переносы есть, updateLayerText обработает их сама
                var lineBreak = findLineBreak(text);
                var splitInfo = null;
                if (!lineBreak) {
                    splitInfo = calculateSplitPosition(text, false);
                }
                if (lineBreak || splitInfo) {
                    updateLayerText(layer, text, splitInfo);
                    success = true;
                }
            }
        }
    } catch (error) {
        alert("Ошибка: " + error.toString());
    } finally {
        app.endUndoGroup();
    }
    
    // Восстанавливаем кнопку
    button.text = originalText;
    button.enabled = true;
    
    if (!success && !createNewLayers) {
        alert("Не удалось разделить текст. Проверьте настройки разделения.");
    }
}

// ============================================================================
// СОЗДАНИЕ НОВЫХ СЛОЕВ
// ============================================================================
function createSplitLayers(comp, layer, text, splitInfo) {
    var textBeforeSplit = text.substring(0, splitInfo.position).trim();
    var textAfterSplit = text.substring(splitInfo.position + splitInfo.length).trim();
    
    // Проверка, что после разделения есть текст в обеих частях
    if (textBeforeSplit.length === 0 || textAfterSplit.length === 0) {
        alert("Результат разделения пуст. Проверьте позицию разделения.");
        return;
    }
    
    var currentTime = comp.time;
    if (splitByMidCheckbox.value) {
        currentTime = setCursorToMid(comp, layer);
        if (currentTime === null) {
            currentTime = comp.time; // Fallback на текущее время
        }
    }
    
    // Создаем первый слой
    var newLayer1 = comp.layers.addText(textBeforeSplit);
    newLayer1.startTime = layer.startTime;
    newLayer1.inPoint = layer.inPoint;
    newLayer1.outPoint = currentTime;
    
    // Создаем второй слой
    var newLayer2 = comp.layers.addText(textAfterSplit);
    newLayer2.startTime = layer.startTime;
    newLayer2.inPoint = currentTime;
    newLayer2.outPoint = layer.outPoint;
    
    // Копируем дополнительные свойства
    copyLayerProperties(layer, newLayer1);
    copyLayerProperties(layer, newLayer2);
    
    layer.remove();
}

// ============================================================================
// ОБНОВЛЕНИЕ ТЕКСТА В СУЩЕСТВУЮЩЕМ СЛОЕ
// ============================================================================
function updateLayerText(layer, text, splitInfo) {
    // Если splitInfo null и нет переносов строк - выходим
    if (!splitInfo && !findLineBreak(text)) {
        alert("Не удалось найти позицию для разделения текста.");
        return;
    }
    
    // Если в тексте уже есть переносы строк, обрабатываем каждую строку отдельно
    var lineBreak = findLineBreak(text);
    if (lineBreak) {
        // Разделяем текст на строки
        var lines = splitTextIntoLines(text);
        var processedLines = [];
        
        // Обрабатываем каждую строку
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            
            // Пропускаем пустые строки
            if (line.length === 0 || line.trim().length === 0) {
                processedLines.push(line);
                continue;
            }
            
            // Пытаемся разделить строку
            var lineSplitInfo = calculateSplitPositionForLine(line);
            
            if (lineSplitInfo && lineSplitInfo.position !== -1) {
                // Разделяем строку
                var lineBefore = line.substring(0, lineSplitInfo.position).trim();
                var lineAfter = line.substring(lineSplitInfo.position + lineSplitInfo.length).trim();
                
                // Проверяем, что обе части не пустые
                if (lineBefore.length > 0 && lineAfter.length > 0) {
                    processedLines.push(lineBefore);
                    processedLines.push(lineAfter);
                } else {
                    // Если не удалось разделить, оставляем строку как есть
                    processedLines.push(line);
                }
            } else {
                // Если не удалось найти позицию разделения, оставляем строку как есть
                processedLines.push(line);
            }
        }
        
        // Собираем результат обратно
        var newText = processedLines.join("\r");
        layer.text.sourceText.setValue(newText);
    } else {
        // Если переносов строк нет, используем старую логику
        var textBeforeSplit = text.substring(0, splitInfo.position).trim();
        var textAfterSplit = text.substring(splitInfo.position + splitInfo.length).trim();
        
        var newText = textBeforeSplit + "\r" + textAfterSplit;
        layer.text.sourceText.setValue(newText);
    }
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ОБРАБОТКИ МНОЖЕСТВЕННЫХ СТРОК
// ============================================================================

// Разделение текста на строки с учетом разных типов переносов
// Оптимизированная версия с использованием indexOf
function splitTextIntoLines(text) {
    var lines = [];
    var currentIndex = 0;
    
    while (currentIndex < text.length) {
        var crlfIndex = text.indexOf("\r\n", currentIndex);
        var crIndex = text.indexOf("\r", currentIndex);
        var lfIndex = text.indexOf("\n", currentIndex);
        
        var nextBreak = text.length;
        if (crlfIndex !== -1) nextBreak = Math.min(nextBreak, crlfIndex);
        if (crIndex !== -1) nextBreak = Math.min(nextBreak, crIndex);
        if (lfIndex !== -1) nextBreak = Math.min(nextBreak, lfIndex);
        
        var line = text.substring(currentIndex, nextBreak);
        lines.push(line);
        
        if (nextBreak === text.length) break;
        
        // Пропускаем символы переноса
        if (crlfIndex === nextBreak) {
            currentIndex = nextBreak + 2;
        } else {
            currentIndex = nextBreak + 1;
        }
    }
    
    return lines;
}

// Расчет позиции разделения для одной строки (без учета переносов строк)
function calculateSplitPositionForLine(line) {
    // 1. Символ разделения (если чекбокс активен)
    if (useSplitSymbolCheckbox.value) {
        var splitSymbol = splitSymbolInput.text;
        if (!splitSymbol || splitSymbol.length === 0) {
            return null;
        }
        var position = line.indexOf(splitSymbol);
        if (position !== -1) {
            return { position: position, length: splitSymbol.length };
        }
    }
    
    // 2. Автоматический поиск пробела
    var middleIndex = Math.floor(line.length / 2);
    var splitIndex = findSplitPosition(line, middleIndex);
    if (splitIndex === -1) {
        return null; // Не удалось найти подходящую позицию
    }
    return { position: splitIndex, length: 1 };
}

// ============================================================================
// КОПИРОВАНИЕ СВОЙСТВ СЛОЯ
// ============================================================================
function copyLayerProperties(source, target) {
    try {
        // Копируем transform свойства, если они доступны
        if (source.transform && target.transform) {
            if (source.transform.position && target.transform.position) {
                target.transform.position.setValue(source.transform.position.value);
            }
            if (source.transform.scale && target.transform.scale) {
                target.transform.scale.setValue(source.transform.scale.value);
            }
            if (source.transform.rotation && target.transform.rotation) {
                target.transform.rotation.setValue(source.transform.rotation.value);
            }
            if (source.transform.opacity && target.transform.opacity) {
                target.transform.opacity.setValue(source.transform.opacity.value);
            }
        }
    } catch (e) {
        // Игнорируем ошибки копирования свойств (некоторые свойства могут быть недоступны)
        $.writeln("Warning: Could not copy some layer properties: " + e.toString());
    }
}

// ============================================================================
// ФУНКЦИЯ ДЛЯ НАХОЖДЕНИЯ ПОДХОДЯЩЕГО ПРОБЕЛА ДЛЯ РАЗДЕЛЕНИЯ ТЕКСТА
// ============================================================================
function findSplitPosition(text, middleIndex) {
    var leftIndex = text.lastIndexOf(" ", middleIndex);
    var rightIndex = text.indexOf(" ", middleIndex);
    
    // Если пробелы не найдены, ничего не нужно разделять
    if (leftIndex === -1 && rightIndex === -1) return -1;
    
    // Определяем позицию разрыва
    var splitIndex =
        leftIndex === -1
            ? rightIndex
            : rightIndex === -1
            ? leftIndex
            : middleIndex - leftIndex <= rightIndex - middleIndex
            ? leftIndex
            : rightIndex;
    
    // Применяем расширенные правила форматирования
    splitIndex = applyAdvancedFormattingRules(text, splitIndex);
    
    return splitIndex;
}

// ============================================================================
// РАСШИРЕННАЯ ФУНКЦИЯ ПРИМЕНЕНИЯ ПРАВИЛ
// ============================================================================
function applyAdvancedFormattingRules(text, splitIndex) {
    var beforeSplit = text.substring(0, splitIndex).trim();
    var afterSplit = text.substring(splitIndex + 1).trim();
    
    // 1. Проверка на слова, которые никогда не разделяются
    if (shouldNeverSplit(beforeSplit, afterSplit)) {
        var newIndex = findAlternativePosition(text, splitIndex);
        if (newIndex !== splitIndex) {
            splitIndex = newIndex;
            beforeSplit = text.substring(0, splitIndex).trim();
            afterSplit = text.substring(splitIndex + 1).trim();
            $.writeln("Split moved due to neverSplitWords");
        }
    }
    
    // 2. Проверка на составные выражения
    if (isCompoundExpression(beforeSplit, afterSplit)) {
        var newIndex = findCompoundSafePosition(text, splitIndex);
        if (newIndex !== splitIndex) {
            splitIndex = newIndex;
            beforeSplit = text.substring(0, splitIndex).trim();
            afterSplit = text.substring(splitIndex + 1).trim();
            $.writeln("Split moved due to compound expression");
        }
    }
    
    // 3. Оригинальные правила (открывающие символы, специальные символы и т.д.)
    splitIndex = applyFormattingRules(text, splitIndex);
    
    return splitIndex;
}

// ============================================================================
// РАСШИРЕННЫЕ ПРАВИЛА ФОРМАТИРОВАНИЯ
// ============================================================================

// Проверка, является ли слово аббревиатурой с числом
function isAbbreviationWithNumber(lastWord, firstWord) {
    // Проверяем, является ли последнее слово аббревиатурой, а следующее - числом
    var isAbbreviation = /^[а-яa-z]+\.[а-яa-z]*\.?$|^[а-яa-z]\.$/i.test(lastWord);
    var isNumber = /^\d+$/.test(firstWord);
    
    return isAbbreviation && isNumber;
}

// Проверка, нужно ли никогда не разделять эти слова
function shouldNeverSplit(beforeSplit, afterSplit) {
    var wordsBefore = beforeSplit.split(' ');
    var wordsAfter = afterSplit.split(' ');
    
    if (wordsBefore.length === 0 || wordsAfter.length === 0) return false;
    
    var lastWord = wordsBefore[wordsBefore.length - 1].toLowerCase();
    var firstWord = wordsAfter[0].toLowerCase();
    
    // Проверяем отдельные слова
    if (neverSplitWords.indexOf(lastWord) !== -1 || neverSplitWords.indexOf(firstWord) !== -1) {
        return true;
    }
    
    // Проверяем комбинации (например, "рис." + "1")
    if (isAbbreviationWithNumber(lastWord, firstWord)) {
        return true;
    }
    
    return false;
}

// Проверка, является ли это составным выражением
function isCompoundExpression(beforeSplit, afterSplit) {
    var wordsBefore = beforeSplit.split(' ');
    var wordsAfter = afterSplit.split(' ');
    
    if (wordsBefore.length < 1 || wordsAfter.length < 1) return false;
    
    // Проверяем последние 2-3 слова перед разделением и первые 2-3 после
    for (var i = 1; i <= 3; i++) {
        if (wordsBefore.length >= i && wordsAfter.length >= (3 - i)) {
            // Используем совместимый способ вместо slice() для ExtendScript
            var testExpression = [];
            // Берем последние i слов из wordsBefore
            for (var j = wordsBefore.length - i; j < wordsBefore.length; j++) {
                testExpression.push(wordsBefore[j]);
            }
            // Берем первые (3-i) слов из wordsAfter
            for (var k = 0; k < (3 - i); k++) {
                testExpression.push(wordsAfter[k]);
            }
            var expressionStr = testExpression.join(' ').toLowerCase();
            
            if (compoundExpressions[expressionStr]) {
                return true;
            }
        }
    }
    
    return false;
}

// Поиск альтернативной позиции разделения
function findAlternativePosition(text, splitIndex) {
    // Пытаемся найти пробел раньше текущей позиции
    var newIndex = text.lastIndexOf(" ", splitIndex - 1);
    if (newIndex !== -1 && newIndex > 0) {
        return newIndex;
    }
    
    // Если не нашли раньше, пытаемся найти позже
    newIndex = text.indexOf(" ", splitIndex + 1);
    if (newIndex !== -1) {
        return newIndex;
    }
    
    // Если ничего не нашли, возвращаем исходную позицию
    return splitIndex;
}

// Поиск безопасной позиции для составных выражений
function findCompoundSafePosition(text, splitIndex) {
    // Пытаемся найти пробел раньше, чтобы не разрывать составное выражение
    var beforeText = text.substring(0, splitIndex);
    var wordsBefore = beforeText.split(' ');
    
    // Ищем позицию на 2-3 слова раньше (совместимый способ без slice)
    if (wordsBefore.length >= 3) {
        var targetWords = [];
        for (var i = 0; i < wordsBefore.length - 3; i++) {
            targetWords.push(wordsBefore[i]);
        }
        var newText = targetWords.join(' ');
        var newIndex = newText.length;
        if (newIndex > 0 && newIndex < splitIndex) {
            return newIndex;
        }
    }
    
    // Если не получилось, ищем позже
    var afterText = text.substring(splitIndex + 1);
    var wordsAfter = afterText.split(' ');
    if (wordsAfter.length >= 3) {
        var targetWordsAfter = [];
        for (var j = 3; j < wordsAfter.length; j++) {
            targetWordsAfter.push(wordsAfter[j]);
        }
        var newTextAfter = targetWordsAfter.join(' ');
        var newIndex = splitIndex + 1 + (afterText.length - newTextAfter.length);
        if (newIndex > splitIndex && newIndex < text.length) {
            return newIndex;
        }
    }
    
    return findAlternativePosition(text, splitIndex);
}

// ============================================================================
// ПРАВИЛА ФОРМАТИРОВАНИЯ
// ============================================================================
function applyFormattingRules(text, splitIndex) {
    // Отрезаем текст до и после предполагаемого разрыва
    var beforeSplit = text.substring(0, splitIndex).trim();
    var afterSplit = text.substring(splitIndex + 1).trim();
    
    // Проверка на предлоги и другие слова из массива avoidEndWords
    var beforeWords = beforeSplit.split(" ");
    if (beforeWords.length > 0) {
        var lastWord = beforeWords[beforeWords.length - 1].toLowerCase();
        if (avoidEndWords.indexOf(lastWord) !== -1) {
            // Если последнее слово перед разрывом из avoidEndWords, перенести разрыв
            var newIndex = beforeSplit.lastIndexOf(" ");
            if (newIndex !== -1) {
                splitIndex = newIndex;
                // Обновляем значения после изменения splitIndex
                beforeSplit = text.substring(0, splitIndex).trim();
                afterSplit = text.substring(splitIndex + 1).trim();
            }
        }
    }
    
    // Печать для отладки
    $.writeln("beforeSplit: " + beforeSplit);
    $.writeln("afterSplit: " + afterSplit);
    
    // Учет символов openingChars
    beforeWords = beforeSplit.split(" ");
    if (beforeWords.length > 0) {
        var lastWordBeforeSplit = beforeWords[beforeWords.length - 1];
        var firstChar = lastWordBeforeSplit.charAt(0);
        
        // Проверяем, начинается ли слово с символа из openingChars
        if (openingChars.indexOf(firstChar) !== -1) {
            // Переносим это слово в следующий слой
            var newIndex = beforeSplit.lastIndexOf(" ");
            if (newIndex !== -1) {
                splitIndex = newIndex;
                // Обновляем значения после изменения splitIndex
                beforeSplit = text.substring(0, splitIndex).trim();
                afterSplit = text.substring(splitIndex + 1).trim();
            }
            $.writeln("Split due to openingChar: " + beforeSplit + " | " + afterSplit);
        }
    }
    
    // Учет спецсимволов (ВАЖНО: сохранена полная логика из оригинального кода)
    var afterWords = afterSplit.split(" ");
    if (afterWords.length > 0) {
        var firstWordAfterSplit = afterWords[0];
        var lastChar = firstWordAfterSplit.charAt(firstWordAfterSplit.length - 1);
        
        // Проверяем, если после разрыва спецсимвол
        if (specialChars.indexOf(lastChar) !== -1) {
            // Проверка на наличие openingChars в начале слова
            var firstCharAfterSplit = firstWordAfterSplit.charAt(0);
            if (openingChars.indexOf(firstCharAfterSplit) === -1) {
                // Если слово не начинается с openingChars, переносим разрыв
                var newSplitIndex = text.indexOf(" ", splitIndex + 1);
                if (newSplitIndex !== -1) {
                    splitIndex = newSplitIndex;
                }
            }
        }
    }
    
    $.writeln("Final splitIndex: " + splitIndex);
    return splitIndex;
}

// ============================================================================
// ФУНКЦИЯ ДЛЯ УСТАНОВКИ КУРСОРА В СЕРЕДИНУ ТЕКСТА
// ============================================================================
function setCursorToMid(comp, layer) {
    if (!comp || !layer) {
        return null;
    }
    
    // Проверка на корректность временных точек
    if (layer.outPoint <= layer.inPoint) {
        alert("Некорректная длительность слоя.");
        return null;
    }
    
    var middleTime = layer.inPoint + (layer.outPoint - layer.inPoint) * 0.5;
    comp.time = middleTime;
    return middleTime;
}

// ============================================================================
// ВАЛИДАЦИЯ ДЛЯ ПЕРЕИМЕНОВАНИЯ: Проверка выбора слоев (все типы)
// ============================================================================
function validateSelectionForRename() {
    if (!app.project || !app.project.activeItem) {
        alert("Откройте композицию.");
        return null;
    }
    
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Активный элемент не является композицией.");
        return null;
    }
    
    if (comp.selectedLayers.length === 0) {
        alert("Пожалуйста, выберите хотя бы один слой.");
        return null;
    }
    
    // Собираем все выбранные слои
    var allLayers = [];
    var textLayers = [];
    var nonTextLayers = [];
    
    for (var i = 0; i < comp.selectedLayers.length; i++) {
        var layer = comp.selectedLayers[i];
        allLayers.push(layer);
        
        if (layer instanceof TextLayer) {
            textLayers.push(layer);
        } else {
            nonTextLayers.push(layer);
        }
    }
    
    // Если есть не-текстовые слои, спрашиваем пользователя
    if (nonTextLayers.length > 0) {
        var message = "Some of the selected layers are not text layers (" + nonTextLayers.length + " layer(s)).\n";
        message += "Rename and number all selected layers?";
        
        var result = confirm(message);
        if (!result) {
            return null; // Пользователь отменил
        }
    }
    
    return { comp: comp, layers: allLayers };
}

// ============================================================================
// ПЕРЕИМЕНОВАНИЕ И НУМЕРАЦИЯ СЛОЕВ
// ============================================================================
function renameAndNumberLayers() {
    var validated = validateSelectionForRename();
    if (!validated) return;
    
    if (validated.layers.length === 0) {
        alert("Нет слоев для переименования.");
        return;
    }
    
    var nameMask = nameMaskInput.text;
    if (!nameMask || nameMask.length === 0) {
        alert("Введите маску имени.");
        return;
    }
    
    // Временно отключаем кнопку
    btnRename.text = "Processing...";
    btnRename.enabled = false;
    
    app.beginUndoGroup("Rename & Number Layers");
    
    try {
        // Создаем массив слоев с их inPoint для сортировки
        var layersWithTime = [];
        for (var i = 0; i < validated.layers.length; i++) {
            layersWithTime.push({
                layer: validated.layers[i],
                inPoint: validated.layers[i].inPoint
            });
        }
        
        // Сортируем по inPoint: чем раньше inPoint, тем выше индекс (ниже в списке)
        // Слои с меньшим inPoint должны иметь больший индекс (быть ниже)
        for (var i = 0; i < layersWithTime.length - 1; i++) {
            for (var j = i + 1; j < layersWithTime.length; j++) {
                if (layersWithTime[i].inPoint < layersWithTime[j].inPoint) {
                    // Меняем местами: меньший inPoint идет дальше в массиве (получит больший индекс)
                    var temp = layersWithTime[i];
                    layersWithTime[i] = layersWithTime[j];
                    layersWithTime[j] = temp;
                }
            }
        }
        
        // Переименовываем и перенумеровываем слои
        for (var i = 0; i < layersWithTime.length; i++) {
            var layer = layersWithTime[i].layer;
            var number = (i + 1).toString();
            
            // Форматируем номер с ведущими нулями (4 цифры)
            while (number.length < 4) {
                number = "0" + number;
            }
            
            // Заменяем {num} на номер
            var newName = nameMask.replace(/{num}/g, number);
            
            // Если маска не содержит {num}, добавляем номер в конец
            if (nameMask.indexOf("{num}") === -1) {
                newName = nameMask + " " + number;
            }
            
            layer.name = newName;
        }
        
        // Перемещаем слои в правильном порядке
        // Слои отсортированы: первый в массиве (поздний inPoint) должен быть выше (меньший индекс)
        // Последний в массиве (ранний inPoint) должен быть ниже (больший индекс)
        // Используем итеративный подход для надежного перемещения
        
        var maxIterations = layersWithTime.length * 2; // Максимальное количество итераций
        var iteration = 0;
        var allCorrect = false;
        
        while (!allCorrect && iteration < maxIterations) {
            allCorrect = true;
            iteration++;
            
            // Проверяем порядок и перемещаем слои при необходимости
            for (var i = 0; i < layersWithTime.length; i++) {
                var layer = layersWithTime[i].layer;
                var previousLayer = (i > 0) ? layersWithTime[i - 1].layer : null;
                
                if (previousLayer) {
                    // Текущий слой должен быть после предыдущего (больший индекс)
                    if (layer.index <= previousLayer.index) {
                        layer.moveAfter(previousLayer);
                        allCorrect = false;
                    }
                } else {
                    // Первый слой - проверяем, что он выше всех остальных выбранных
                    for (var j = 1; j < layersWithTime.length; j++) {
                        if (layer.index > layersWithTime[j].layer.index) {
                            layer.moveBefore(validated.comp.layer(layersWithTime[j].layer.index));
                            allCorrect = false;
                            break;
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        alert("Ошибка при переименовании: " + error.toString());
    } finally {
        app.endUndoGroup();
    }
    
    // Восстанавливаем кнопку
    btnRename.text = "Rename & Number Layers";
    btnRename.enabled = true;
}

// ============================================================================
// НАЗНАЧЕНИЕ ОБРАБОТЧИКОВ
// ============================================================================
btnSplit.onClick = function() { handleSplit(true); };
btnSplitInLayer.onClick = function() { handleSplit(false); };
btnRename.onClick = function() { renameAndNumberLayers(); };

// ============================================================================
// ПОКАЗ ОКНА
// ============================================================================
win.center();
win.show();
