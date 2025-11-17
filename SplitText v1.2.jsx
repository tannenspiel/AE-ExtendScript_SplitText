// ============================================================
// Split Text v1.2 - Улучшенная версия с оптимизациями
// ============================================================

// Создаем интерфейс с кнопкой для разделения текста
var win = new Window("palette", "Split Text v1.2");
win.margins = 10;

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

// Чекбокс для разделения по строкам
var splitByLinesCheckbox = optionsPanel.add("checkbox", undefined, "Split into Layers by Lines");
splitByLinesCheckbox.alignment = "left";
splitByLinesCheckbox.value = false;
splitByLinesCheckbox.helpTip = "When enabled, 'Split into Layers' divides text by lines. If text has multiple lines, each line becomes a separate layer.";

var splitByMidCheckbox = optionsPanel.add("checkbox", undefined, "Split at Layer Middle");
splitByMidCheckbox.alignment = "left";
splitByMidCheckbox.value = false;
splitByMidCheckbox.helpTip = "Automatically split the text at the middle point of the layer's duration. No need to manually position the timeline cursor.";

// Чекбокс для использования символа разделения
var useSplitSymbolCheckbox = optionsPanel.add("checkbox", undefined, "Use Split Symbol");
useSplitSymbolCheckbox.alignment = "left";
useSplitSymbolCheckbox.value = false;
useSplitSymbolCheckbox.helpTip = "Place the specified symbol (or any symbol you prefer) in the text where you want the split to occur.";

// Поле для ввода символа разделения (внутри панели Options)
var symbolLabel = optionsPanel.add("statictext", undefined, "Split Symbol:");
symbolLabel.alignment = "fill";
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

// Чекбокс "Up" для инвертированной нумерации
var upCheckbox = renamePanel.add("checkbox", undefined, "Up");
upCheckbox.alignment = "left";
upCheckbox.helpTip = "When enabled: earliest inPoint gets highest number and is placed at bottom. When disabled: earliest inPoint gets number 0001 and is placed at top.";

// СТАТУС-БАР
var statusBar = win.add("statictext", undefined, "Ready");
statusBar.alignment = "fill";
statusBar.graphics.font = ScriptUI.newFont("Arial", ScriptUI.FontStyle.REGULAR, 10);

// Обновление статуса
function updateStatus(msg) {
    statusBar.text = msg;
}

// Подвал с контактной информацией
var footerLabel = win.add("statictext", undefined, "tannenspiel@gmail.com");
footerLabel.alignment = "center";
footerLabel.graphics.font = ScriptUI.newFont(footerLabel.graphics.font.name, ScriptUI.FontStyle.REGULAR, 9);

// ============================================================
// ОПТИМИЗИРОВАННЫЕ ДАННЫЕ (O(1) поиск)
// ============================================================

// Массивы преобразованы в объекты для быстрого поиска
// ТОЛЬКО слова, которые не могут быть в конце строки (предлоги, артикли, союзы, местоимения)
var avoidEndWords = {
    // Русский - только предлоги, частицы, союзы, местоимения
    "и":1, "а":1, "но":1, "или":1, "да":1, "то":1, "по":1, "к":1, "с":1, "о":1, "у":1, "в":1, "на":1, "за":1, "от":1, "до":1,
    "об":1, "из":1, "над":1, "под":1, "при":1, "про":1, "без":1, "для":1, "же":1, "ли":1, "бы":1, "не":1, "ни":1, "уж":1,
    "во":1, "со":1, "изо":1, "ко":1, "обо":1, "подо":1, "передо":1, "что":1, "как":1, "чтоб":1, "чтобы":1, "кабы":1,
    "который":1, "которая":1, "которое":1, "которые":1,
    "я":1, "ты":1, "он":1, "она":1, "оно":1, "мы":1, "вы":1, "они":1, "меня":1, "тебя":1, "его":1, "её":1, "их":1,
    "мне":1, "тебе":1, "ему":1, "ей":1, "нам":1, "вам":1, "им":1, "мной":1, "тобой":1, "им":1, "ей":1, "нами":1, "вами":1, "ими":1,
    "мой":1, "твой":1, "его":1, "её":1, "наш":1, "ваш":1, "их":1, "свой":1,
    "моя":1, "твоя":1, "наша":1, "ваша":1, "моё":1, "твоё":1, "наше":1, "ваше":1,
    "мои":1, "твои":1, "наши":1, "ваши":1,
    "этот":1, "эта":1, "это":1, "эти":1, "тот":1, "та":1, "то":1, "те":1, "такой":1, "такая":1, "такое":1, "такие":1,
    "перед":1, "пред":1, "после":1, "между":1, "среди":1, "вокруг":1, "возле":1, "около":1, "ради":1, "через":1, "сквозь":1,
    
    // Английский - только предлоги, артикли, союзы, местоимения
    "a":1, "an":1, "the":1,
    "of":1, "to":1, "in":1, "on":1, "at":1, "by":1, "for":1, "with":1, "about":1, "against":1, "between":1, "into":1,
    "through":1, "during":1, "before":1, "after":1, "above":1, "below":1, "up":1, "down":1, "out":1, "off":1, "over":1, "under":1,
    "again":1, "further":1, "then":1, "once":1,
    "and":1, "or":1, "but":1, "so":1, "yet":1, "nor":1, "as":1, "than":1, "too":1,
    "how":1, "when":1, "where":1, "why":1,
    "i":1, "you":1, "he":1, "she":1, "it":1, "we":1, "they":1, "me":1, "him":1, "her":1, "us":1, "them":1,
    "my":1, "your":1, "his":1, "her":1, "its":1, "our":1, "their":1,
    "this":1, "that":1, "these":1, "those":1,
    "aboard":1, "across":1, "along":1, "amid":1, "among":1, "behind":1, "beneath":1, "beside":1, "beyond":1,
    "concerning":1, "considering":1, "despite":1, "except":1, "from":1, "inside":1, "like":1, "near":1,
    "onto":1, "outside":1, "past":1, "regarding":1, "round":1, "throughout":1, "till":1, "toward":1,
    "underneath":1, "until":1, "unto":1, "upon":1, "within":1, "without":1,
    "although":1, "because":1, "since":1, "unless":1, "while":1, "whereas":1, "though":1, "if":1, "whether":1
};

// Слова, которые НИКОГДА не следует разделять
var neverSplitWords = {
    // Русские
    "и т.д.":1, "и т.п.":1, "т.е.":1, "т.к.":1, "т.н.":1, "н.э.":1, "до н.э.":1, "см.":1, "стр.":1, "рис.":1, 
    "др.":1, "проф.":1, "акад.":1, "им.":1, "ст.":1, "гл.":1, "разд.":1, "пар.":1, "п.":1, "с.":1, "г.":1,
    
    // Английские
    "etc.":1, "e.g.":1, "i.e.":1, "vs.":1, "etc":1, "eg":1, "ie":1, "vs":1, "fig.":1, "page":1, "pp.":1, "chap.":1,
    "sec.":1, "para.":1, "art.":1, "no.":1, "vol.":1, "ed.":1, "dept.":1, "univ.":1, "assoc.":1, "inc.":1,
    "ltd.":1, "co.":1, "corp.":1, "mr.":1, "mrs.":1, "ms.":1, "dr.":1, "prof.":1, "rev.":1, "hon.":1,
    
    // Числа и единицы измерения
    "kg":1, "g":1, "mg":1, "lb":1, "oz":1, "km":1, "m":1, "cm":1, "mm":1, "mi":1, "yd":1, "ft":1, "in":1,
    "l":1, "ml":1, "gal":1, "qt":1, "pt":1, "sec":1, "min":1, "hr":1, "h":1, "m":1, "s":1
};

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
    "prior to": true, "subsequent to": true, "thanks to": true, "contrary to": true,
    
    // ==================== ГЕОГРАФИЧЕСКИЕ НАЗВАНИЯ ====================
    // США
    "new york": true, "los angeles": true, "san francisco": true, "las vegas": true, "san diego": true,
    "san antonio": true, "san jose": true, "oklahoma city": true, "kansas city": true, "salt lake city": true,
    "new orleans": true, "las cruces": true, "palo alto": true, "beverly hills": true, "cedar rapids": true,
    "grand rapids": true, "sioux falls": true, "rapid city": true, "bowling green": true, "college station": true,
    
    // Великобритания
    "newcastle upon tyne": true, "stratford upon avon": true, "bournemouth christchurch": true,
    "weston super mare": true, "bishops stortford": true, "kings lynn": true, "richmond upon thames": true,
    
    // Канада
    "british columbia": true, "new brunswick": true, "nova scotia": true, "prince edward island": true,
    "quebec city": true, "thunder bay": true, "grand prairie": true, "fort mcmurray": true, "st johns": true,
    
    // Австралия
    "gold coast": true, "sunshine coast": true, "coffs harbour": true, "port macquarie": true, "hervey bay": true,
    "alice springs": true, "mount isa": true, "broken hill": true, "victor harbor": true,
    
    // Международные
    "buenos aires": true, "rio de janeiro": true, "sao paulo": true, "porto alegre": true, "belo horizonte": true,
    "kuala lumpur": true, "hong kong": true, "new delhi": true, "mumbai suburban": true, "addis ababa": true,
    "cape town": true, "port elizabeth": true, "east london": true, "santiago de chile": true, "san salvador": true,
    "santo domingo": true, "port au prince": true, "costa rica": true, "el salvador": true, "sierra leone": true,
    
    // Российские города
    "нижний новгород": true, "великий новгород": true, "набережные челны": true, "сергиев посад": true,
    "новый уренгой": true, "старый оскол": true, "южно-сахалинск": true, "великие луки": true,
    "красный сулин": true, "белый яр": true, "черный яр": true, "светлый яр": true, "зеленый бор": true,
    "железногорск илимский": true, "советская гавань": true, "магаданская область": true,
    "камчатский край": true, "ставропольский край": true, "краснодарский край": true,
    
    // Украинские
    "запорожская область": true, "ивано франковск": true, "николаевская область": true,
    
    // Белорусские
    "новая гута": true, "белая церковь": true, "черная волока": true,
    
    // Транслитерации
    "лос анджелес": true, "нью йорк": true, "сан франциско": true, "лас вегас": true, "сан диего": true,
    "нью орлеанс": true, "канзас сити": true, "солт лейк сити": true, "буэнос айрес": true,
    "рио де жанейро": true, "сан паулу": true, "кейп таун": true, "гонконг": true, "нью дели": true,
    "куала лумпур": true, "адис абеба": true, "сантьяго де чили": true,
    
    // Английские написания русских городов
    "st petersburg": true, "saint petersburg": true, "nizhny novgorod": true, "veliky novgorod": true,
    "rostov on don": true, "yuzhno sakhalinsk": true, "sergiev posad": true, "naberezhnye chelny": true,
    
    // Регионы и штаты
    "new south wales": true, "western australia": true, "south australia": true, "northern territory": true,
    "north carolina": true, "south carolina": true, "north dakota": true, "south dakota": true,
    "west virginia": true, "rhode island": true, "new mexico": true, "new hampshire": true, "new jersey": true,
    
    // Российские регионы
    "ханты мансийский автономный округ": true, "ямало ненецкий автономный округ": true,
    "ненецкий автономный округ": true, "чукотский автономный округ": true,
    "еврейская автономная область": true, "республика саха": true, "республика коми": true,
    "республика карелия": true, "республика башкортостан": true, "республика татарстан": true,
    
    // ==================== КОМПАНИИ И БРЕНДЫ ====================
    // Международные компании
    "general motors": true, "general electric": true, "general dynamics": true, "general mills": true,
    "goldman sachs": true, "morgan stanley": true, "jpmorgan chase": true, "procter gamble": true,
    "johnson johnson": true, "home depot": true, "best buy": true, "pricewaterhousecoopers": true,
    "ernst young": true, "deloitte touche": true, "kpmg international": true, "booz allen": true,
    "lockheed martin": true, "northrop grumman": true, "raytheon technologies": true, "boeing company": true,
    "ford motor": true,
    
    // Технологические
    "hewlett packard": true, "dell technologies": true, "texas instruments": true, "western digital": true,
    "seagate technology": true, "micron technology": true, "broadcom limited": true, "qualcomm incorporated": true,
    
    // Русскоязычные
    "альфа банк": true, "газпром нефть": true, "лукойл оверсиз": true, "роснефть бункер": true,
    "сбербанк страхование": true, "тинькофф страхование": true, "яндекс такси": true, "яндекс еда": true,
    "яндекс маркет": true, "яндекс драйв": true, "м видео": true, "эльдорадо": true, "детский мир": true,
    
    // Розничные сети
    "metro cash carry": true, "auchan retail": true, "leroy merlin": true, "castorama france": true,
    "decathlon france": true, "media markt": true, "saturn elektronik": true
};

// Список символов, которые считаются открывающими (например, кавычки, скобки)
var openingChars = {'"':1, "'":1, "(":1, "[":1, "{":1, "«":1};

// Список символов, которые должны перенести позицию на следующий пробел
var specialChars = {",":1, ".":1, "!":1, "?":1, ":":1, ";":1};

// ============================================================================
// ВАЛИДАЦИЯ: Проверка выбора текстового слоя
// ============================================================================
function validateSelection() {
    if (!app.project || !app.project.activeItem) {
        alert("Open a composition.");
        return null;
    }
    
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Active item is not a composition.");
        return null;
    }
    
    if (comp.selectedLayers.length === 0) {
        alert("Please select at least one text layer.");
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
        alert("Selected layers are not text layers or are empty.");
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
            alert("Enter split symbol.");
            return null;
        }
        var position = text.indexOf(splitSymbol);
        if (position === -1) {
            alert("Split symbol not found in text.");
            return null;
        }
        return { position: position, length: splitSymbol.length };
    }
    
    // 3. Автоматический поиск пробела
    var middleIndex = Math.floor(text.length / 2);
    var splitIndex = findSplitPosition(text, middleIndex);
    if (splitIndex === -1) {
        alert("Could not find suitable space for splitting.");
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
                // Проверяем, включен ли режим разделения по строкам
                if (splitByLinesCheckbox.value) {
                    // Режим разделения по строкам
                    var lines = splitTextIntoLines(text);
                    // Разделяем на слои по строкам (проверка на количество строк внутри функции)
                    if (createLayersFromLines(validated.comp, layer, lines)) {
                        success = true;
                    }
                } else {
                    // Обычный режим: Для Split Text проверяем переносы строк
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
        alert("Error: " + error.toString());
    } finally {
        app.endUndoGroup();
    }
    
    // Восстанавливаем кнопку
    button.text = originalText;
    button.enabled = true;
    
    if (success) {
        updateStatus(createNewLayers ? "✓ Split into Layers" : "✓ Split into Lines");
    } else if (!createNewLayers) {
        alert("Could not split text. Check split settings.");
    }
}

// ============================================================================
// СОЗДАНИЕ СЛОЕВ ИЗ СТРОК
// ============================================================================
function createLayersFromLines(comp, layer, lines) {
    if (lines.length < 2) {
        alert("Not enough lines for splitting.");
        return false;
    }
    
    // Подсчитываем количество непустых строк
    var nonEmptyLines = [];
    for (var i = 0; i < lines.length; i++) {
        var lineText = lines[i].trim();
        if (lineText.length > 0) {
            nonEmptyLines.push(lineText);
        }
    }
    
    if (nonEmptyLines.length < 2) {
        alert("Text contains only one non-empty line. Splitting by lines is not possible.");
        return false;
    }
    
    var layerDuration = layer.outPoint - layer.inPoint;
    var timePerLine = layerDuration / nonEmptyLines.length;
    var currentTime = layer.inPoint;
    
    // Создаем слои для каждой непустой строки
    for (var i = 0; i < nonEmptyLines.length; i++) {
        var newLayer = comp.layers.addText(nonEmptyLines[i]);
        newLayer.startTime = layer.startTime;
        newLayer.inPoint = currentTime;
        newLayer.outPoint = currentTime + timePerLine;
        
        // Копируем свойства исходного слоя
        copyLayerProperties(layer, newLayer);
        
        currentTime += timePerLine;
    }
    
    // Удаляем исходный слой
    layer.remove();
    return true;
}

// ============================================================================
// СОЗДАНИЕ НОВЫХ СЛОЕВ
// ============================================================================
function createSplitLayers(comp, layer, text, splitInfo) {
    var textBeforeSplit = text.substring(0, splitInfo.position).trim();
    var textAfterSplit = text.substring(splitInfo.position + splitInfo.length).trim();
    
    // Проверка, что после разделения есть текст в обеих частях
    if (textBeforeSplit.length === 0 || textAfterSplit.length === 0) {
        alert("Split result is empty. Check split position.");
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
        alert("Could not find position for text splitting.");
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
            
            if (lineSplitInfo && lineSplitInfo.position !== undefined && lineSplitInfo.position !== -1) {
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
    
    // 1. ПРИОРИТЕТ #1: проверка на составные выражения (многословные предлоги, географические названия, компании)
    var isCompound = isCompoundExpression(beforeSplit, afterSplit);
    if (isCompound) {
        var newIndex = findCompoundSafePosition(text, splitIndex);
        if (newIndex !== splitIndex) {
            splitIndex = newIndex;
            beforeSplit = text.substring(0, splitIndex).trim();
            afterSplit = text.substring(splitIndex + 1).trim();
        }
    }
    
    // 2. ПРИОРИТЕТ #2: проверка на слова из avoidEndWords (предлоги, артикли, союзы, местоимения)
    var beforeWords = beforeSplit.split(" ");
    if (beforeWords.length > 0) {
        var lastWord = beforeWords[beforeWords.length - 1].toLowerCase();
        if (avoidEndWords[lastWord]) {
            // Если последнее слово перед разрывом из avoidEndWords, перенести разрыв
            var newIndex = beforeSplit.lastIndexOf(" ");
            if (newIndex !== -1 && newIndex > 0) {
                splitIndex = newIndex;
                beforeSplit = text.substring(0, splitIndex).trim();
                afterSplit = text.substring(splitIndex + 1).trim();
            }
        }
    }
    
    // 3. Проверка на слова, которые никогда не разделяются
    if (shouldNeverSplit(beforeSplit, afterSplit)) {
        var newIndex = findAlternativePosition(text, splitIndex);
        if (newIndex !== splitIndex) {
            splitIndex = newIndex;
            beforeSplit = text.substring(0, splitIndex).trim();
            afterSplit = text.substring(splitIndex + 1).trim();
        }
    }
    
    // 4. Проверка на специальные термины (города, бренды, имена)
    if (isSpecialTerm(beforeSplit, afterSplit)) {
        var newIndex = findAlternativePosition(text, splitIndex);
        if (newIndex !== splitIndex) {
            splitIndex = newIndex;
            beforeSplit = text.substring(0, splitIndex).trim();
            afterSplit = text.substring(splitIndex + 1).trim();
        }
    }
    
    // 5. Оригинальные правила (открывающие символы, специальные символы и т.д.)
    // Применяем только базовые правила, которые не конфликтуют с составными выражениями
    splitIndex = applyBasicFormattingRules(text, splitIndex, beforeSplit, afterSplit);
    
    return splitIndex;
}

// Базовые правила форматирования (без проверки avoidEndWords, так как она уже в applyAdvancedFormattingRules)
function applyBasicFormattingRules(text, splitIndex, beforeSplit, afterSplit) {
    // Обновляем значения, если они не переданы
    if (!beforeSplit || !afterSplit) {
        beforeSplit = text.substring(0, splitIndex).trim();
        afterSplit = text.substring(splitIndex + 1).trim();
    }
    
    // Учет символов openingChars
    var beforeWords = beforeSplit.split(" ");
    if (beforeWords.length > 0) {
        var lastWordBeforeSplit = beforeWords[beforeWords.length - 1];
        var firstChar = lastWordBeforeSplit.charAt(0);
        
        // Проверяем, начинается ли слово с символа из openingChars
        if (openingChars[firstChar]) {
            // Переносим это слово в следующий слой
            var newIndex = beforeSplit.lastIndexOf(" ");
            if (newIndex !== -1) {
                splitIndex = newIndex;
            }
        }
    }
    
    // Учет спецсимволов
    var afterWords = afterSplit.split(" ");
    if (afterWords.length > 0) {
        var firstWordAfterSplit = afterWords[0];
        var lastChar = firstWordAfterSplit.charAt(firstWordAfterSplit.length - 1);
        
        // Проверяем, если после разрыва спецсимвол
        if (specialChars[lastChar]) {
            // Проверка на наличие openingChars в начале слова
            var firstCharAfterSplit = firstWordAfterSplit.charAt(0);
            if (!openingChars[firstCharAfterSplit]) {
                // Если слово не начинается с openingChars, переносим разрыв
                var newSplitIndex = text.indexOf(" ", splitIndex + 1);
                if (newSplitIndex !== -1) {
                    splitIndex = newSplitIndex;
                }
            }
        }
    }
    
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
    
    // Проверяем отдельные слова (O(1) поиск через объект)
    if (neverSplitWords[lastWord] || neverSplitWords[firstWord]) {
        return true;
    }
    
    // Проверяем комбинации (например, "рис." + "1")
    if (isAbbreviationWithNumber(lastWord, firstWord)) {
        return true;
    }
    
    return false;
}

// Проверка на специальные термины (города, бренды, имена)
function isSpecialTerm(beforeSplit, afterSplit) {
    var wordsBefore = beforeSplit.split(' ');
    var wordsAfter = afterSplit.split(' ');
    
    if (wordsBefore.length === 0 || wordsAfter.length === 0) return false;
    
    // Проверяем комбинации слов (например, "New York", "General Motors")
    // Проверяем от 1 до 3 слов с каждой стороны
    for (var i = 1; i <= 3; i++) {
        if (wordsBefore.length >= i && wordsAfter.length >= (3 - i)) {
            // Используем совместимый способ вместо slice() для ExtendScript
            var testTerm = [];
            // Берем последние i слов из wordsBefore
            for (var j = wordsBefore.length - i; j < wordsBefore.length; j++) {
                testTerm.push(wordsBefore[j]);
            }
            // Берем первые (3-i) слов из wordsAfter
            for (var k = 0; k < (3 - i); k++) {
                testTerm.push(wordsAfter[k]);
            }
            var termStr = testTerm.join(' ').toLowerCase();
            
            // Проверяем в compoundExpressions (там уже есть все географические названия и компании)
            // Но проверяем только те, которые относятся к географическим названиям и компаниям
            // Для этого проверяем, есть ли это выражение в compoundExpressions
            // и не является ли оно обычной фразой (проверяем по ключевым словам)
            if (compoundExpressions[termStr]) {
                // Проверяем, что это не обычная фразеологическая конструкция
                var isPhrase = (termStr.indexOf("так ") === 0 || 
                               termStr.indexOf("в ") === 0 || 
                               termStr.indexOf("по ") === 0 ||
                               termStr.indexOf("even ") === 0 ||
                               termStr.indexOf("as ") === 0 ||
                               termStr.indexOf("in ") === 0 ||
                               termStr.indexOf("with ") === 0 ||
                               termStr.indexOf("according ") === 0 ||
                               termStr.indexOf("because ") === 0 ||
                               termStr.indexOf("due ") === 0 ||
                               termStr.indexOf("instead ") === 0 ||
                               termStr.indexOf("other ") === 0 ||
                               termStr.indexOf("prior ") === 0 ||
                               termStr.indexOf("subsequent ") === 0 ||
                               termStr.indexOf("thanks ") === 0 ||
                               termStr.indexOf("contrary ") === 0);
                
                // Если это не фраза, значит это специальный термин (город, компания и т.д.)
                if (!isPhrase) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Проверка, является ли это составным выражением
function isCompoundExpression(beforeSplit, afterSplit) {
    var wordsBefore = beforeSplit.split(' ');
    var wordsAfter = afterSplit.split(' ');
    
    if (wordsBefore.length < 1 || wordsAfter.length < 1) return false;
    
    // Проверяем комбинации от 1 до 3 слов с каждой стороны
    // Для двухсловных выражений (например, "new york"): проверяем 1+1
    // Для трехсловных (например, "in order to"): проверяем 1+2, 2+1
    for (var wordsFromBefore = 1; wordsFromBefore <= 3; wordsFromBefore++) {
        for (var wordsFromAfter = 1; wordsFromAfter <= 3; wordsFromAfter++) {
            // Проверяем только если общее количество слов <= 3 (для оптимизации)
            if (wordsFromBefore + wordsFromAfter > 3) continue;
            
            if (wordsBefore.length >= wordsFromBefore && wordsAfter.length >= wordsFromAfter) {
            // Используем совместимый способ вместо slice() для ExtendScript
            var testExpression = [];
                // Берем последние wordsFromBefore слов из wordsBefore
                for (var j = wordsBefore.length - wordsFromBefore; j < wordsBefore.length; j++) {
                testExpression.push(wordsBefore[j]);
            }
                // Берем первые wordsFromAfter слов из wordsAfter
                for (var k = 0; k < wordsFromAfter; k++) {
                testExpression.push(wordsAfter[k]);
            }
            var expressionStr = testExpression.join(' ').toLowerCase();
                
                if (compoundExpressions[expressionStr]) {
                    return true;
                }
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
    var beforeText = text.substring(0, splitIndex);
    var wordsBefore = beforeText.split(' ');
    var afterText = text.substring(splitIndex + 1);
    var wordsAfter = afterText.split(' ');
    
    // Для двухсловных выражений: ищем позицию между ними
    if (wordsBefore.length >= 1 && wordsAfter.length >= 1) {
        var phrase = wordsBefore[wordsBefore.length - 1] + ' ' + wordsAfter[0];
        if (compoundExpressions[phrase.toLowerCase()]) {
            // Находим позицию перед вторым словом в afterText (более точно)
            var posInAfterText = afterText.indexOf(wordsAfter[0]);
            if (posInAfterText !== -1) {
                var pos = splitIndex + 1 + posInAfterText;
                if (pos > splitIndex) return pos - 1;
            }
        }
    }
    
    // Для трехсловных: ищем позицию после второго слова
    if (wordsBefore.length >= 2 && wordsAfter.length >= 1) {
        var phrase = wordsBefore[wordsBefore.length - 2] + ' ' + 
                     wordsBefore[wordsBefore.length - 1] + ' ' + 
                     wordsAfter[0];
        if (compoundExpressions[phrase.toLowerCase()]) {
            var tempText = text.substring(0, splitIndex);
            var lastSpace = tempText.lastIndexOf(' ');
            if (lastSpace > 0) {
                var secondLastSpace = tempText.substring(0, lastSpace).lastIndexOf(' ');
                if (secondLastSpace > 0) return secondLastSpace;
            }
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
        if (avoidEndWords[lastWord]) {
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
    
    // Учет символов openingChars
    beforeWords = beforeSplit.split(" ");
    if (beforeWords.length > 0) {
        var lastWordBeforeSplit = beforeWords[beforeWords.length - 1];
        var firstChar = lastWordBeforeSplit.charAt(0);
        
        // Проверяем, начинается ли слово с символа из openingChars
        if (openingChars[firstChar]) {
            // Переносим это слово в следующий слой
            var newIndex = beforeSplit.lastIndexOf(" ");
            if (newIndex !== -1) {
                splitIndex = newIndex;
                // Обновляем значения после изменения splitIndex
                beforeSplit = text.substring(0, splitIndex).trim();
                afterSplit = text.substring(splitIndex + 1).trim();
            }
        }
    }
    
    // Учет спецсимволов (ВАЖНО: сохранена полная логика из оригинального кода)
    var afterWords = afterSplit.split(" ");
    if (afterWords.length > 0) {
        var firstWordAfterSplit = afterWords[0];
        var lastChar = firstWordAfterSplit.charAt(firstWordAfterSplit.length - 1);
        
        // Проверяем, если после разрыва спецсимвол
        if (specialChars[lastChar]) {
            // Проверка на наличие openingChars в начале слова
            var firstCharAfterSplit = firstWordAfterSplit.charAt(0);
            if (!openingChars[firstCharAfterSplit]) {
                // Если слово не начинается с openingChars, переносим разрыв
                var newSplitIndex = text.indexOf(" ", splitIndex + 1);
                if (newSplitIndex !== -1) {
                    splitIndex = newSplitIndex;
                }
            }
        }
    }
    
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
        alert("Invalid layer duration.");
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
        alert("Open a composition.");
        return null;
    }
    
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Active item is not a composition.");
        return null;
    }
    
    if (comp.selectedLayers.length === 0) {
        alert("Please select at least one layer.");
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
        alert("No layers to rename.");
        return;
    }
    
    var nameMask = nameMaskInput.text.trim();
    if (!nameMask || nameMask.length === 0) {
        alert("Enter name mask.");
        return;
    }
    
    if (nameMask.length > 50) {
        alert("Name mask is too long. Maximum 50 characters.");
        return;
    }
    
    if (validated.layers.length > 100) {
        var result = confirm("Selected " + validated.layers.length + " layers. This may take some time. Continue?");
        if (!result) return;
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
        
        // Сортируем по inPoint
        var isUpMode = upCheckbox.value;
        
        if (isUpMode) {
            // Режим "Up": чем раньше inPoint, тем позже в массиве (получит больший номер)
            // Слои с меньшим inPoint должны быть последними в массиве (получить номер [количество слоев], [количество-1], ...)
            for (var i = 0; i < layersWithTime.length - 1; i++) {
                for (var j = i + 1; j < layersWithTime.length; j++) {
                    if (layersWithTime[i].inPoint < layersWithTime[j].inPoint) {
                        // Меняем местами: меньший inPoint идет дальше в массиве (получит больший номер)
                        var temp = layersWithTime[i];
                        layersWithTime[i] = layersWithTime[j];
                        layersWithTime[j] = temp;
                    }
                }
            }
        } else {
            // Обычный режим: чем раньше inPoint, тем раньше в массиве (получит меньший номер)
            // Слои с меньшим inPoint должны быть первыми в массиве (получить номер 0001, 0002, ...)
            for (var i = 0; i < layersWithTime.length - 1; i++) {
                for (var j = i + 1; j < layersWithTime.length; j++) {
                    if (layersWithTime[i].inPoint > layersWithTime[j].inPoint) {
                        // Меняем местами: меньший inPoint идет раньше в массиве (получит меньший номер)
                        var temp = layersWithTime[i];
                        layersWithTime[i] = layersWithTime[j];
                        layersWithTime[j] = temp;
                    }
                }
            }
        }
        
        // Переименовываем и перенумеровываем слои
        var isUpMode = upCheckbox.value;
        var totalLayers = layersWithTime.length;
        
        for (var i = 0; i < layersWithTime.length; i++) {
            var layer = layersWithTime[i].layer;
            var number;
            
            if (isUpMode) {
                // Режим "Up": нумеруем от последнего к первому
                // Индекс 0 (самый поздний inPoint) → номер [totalLayers]
                // Индекс 1 → номер [totalLayers - 1]
                // Индекс i → номер [totalLayers - i]
                number = (totalLayers - i).toString();
            } else {
                // Обычный режим: нумеруем от первого к последнему
                // Индекс 0 (самый ранний inPoint) → номер 0001
                // Индекс 1 → номер 0002
                number = (i + 1).toString();
            }
            
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
        var isUpMode = upCheckbox.value;
        
        if (isUpMode) {
            // Режим "Up": первый в массиве (поздний inPoint) должен быть выше (меньший индекс)
            // Последний в массиве (ранний inPoint) должен быть ниже (больший индекс)
            var maxIterations = layersWithTime.length * 2;
            var iteration = 0;
            var allCorrect = false;
            
            while (!allCorrect && iteration < maxIterations) {
                allCorrect = true;
                iteration++;
                
                for (var i = 0; i < layersWithTime.length; i++) {
                    var layer = layersWithTime[i].layer;
                    var previousLayer = (i > 0) ? layersWithTime[i - 1].layer : null;
                    
                    if (previousLayer) {
                        // Текущий слой должен быть после предыдущего (больший индекс)
                        // Текущий слой имеет более ранний inPoint, чем предыдущий
                        if (layer.index <= previousLayer.index) {
                            layer.moveAfter(previousLayer);
                            allCorrect = false;
                        }
                    } else {
                        // Первый слой (самый поздний inPoint) - проверяем, что он выше всех остальных выбранных
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
        } else {
            // Обычный режим: первый в массиве (ранний inPoint) должен быть выше (меньший индекс)
            // Последний в массиве (поздний inPoint) должен быть ниже (больший индекс)
            var maxIterations = layersWithTime.length * 2;
            var iteration = 0;
            var allCorrect = false;
            
            while (!allCorrect && iteration < maxIterations) {
                allCorrect = true;
                iteration++;
                
                for (var i = 0; i < layersWithTime.length; i++) {
                    var layer = layersWithTime[i].layer;
                    var previousLayer = (i > 0) ? layersWithTime[i - 1].layer : null;
                    
                    if (previousLayer) {
                        // Текущий слой должен быть после предыдущего (больший индекс)
                        // Текущий слой имеет более поздний inPoint, чем предыдущий
                        if (layer.index <= previousLayer.index) {
                            layer.moveAfter(previousLayer);
                            allCorrect = false;
                        }
                    } else {
                        // Первый слой (самый ранний inPoint) - проверяем, что он выше всех остальных выбранных
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
        }
        
    } catch (error) {
        alert("Error renaming: " + error.toString());
    } finally {
        app.endUndoGroup();
    }
    
    // Восстанавливаем кнопку
    btnRename.text = "Rename & Number Layers";
    btnRename.enabled = true;
    
    if (validated && validated.layers.length > 0) {
        updateStatus("✓ Renamed " + validated.layers.length + " layers");
    }
}

// ============================================================================
// НАЗНАЧЕНИЕ ОБРАБОТЧИКОВ
// ============================================================================
btnSplit.onClick = function() { handleSplit(true); };
btnSplitInLayer.onClick = function() { handleSplit(false); };
btnRename.onClick = function() { renameAndNumberLayers(); };

// ============================================================================
// ОБНОВЛЕНИЕ СТАТУСА ПРИ ОТКРЫТИИ
// ============================================================================
win.onShow = function() {
    var count = 0;
    if (app.project && app.project.activeItem) {
        count = app.project.activeItem.selectedLayers.length;
    }
    updateStatus("Selected: " + count + " layer(s)");
};

// ============================================================================
// ПОКАЗ ОКНА
// ============================================================================
win.center();
win.show();
