# SplitText.jsx - Documentation

## 📖 Description

**SplitText.jsx** is a script for Adobe After Effects designed for intelligent text layer splitting with respect to formatting rules, geographical names, company names, and other special terms.

**Version**: 1.2  
**Author**: tannenspiel@gmail.com  
**Language**: ExtendScript (JavaScript for Adobe)

## 🎯 Main Features

### 1. Split Text into Layers
- Splits a text layer into two separate layers (or multiple layers if "Split into Layers by Lines" is enabled)
- Supports multiple layer selection
- Automatically copies source layer properties (position, scale, rotation, opacity)
- Supports splitting by symbol, by lines, or automatically at the middle
- **"Split into Layers by Lines" mode**: When enabled, divides text by lines - each line becomes a separate layer

### 2. Split Text into Lines
- Splits a long line into two lines in the same layer
- Recursively processes all lines in the text
- Supports different line break types (\r\n, \r, \n)

### 3. Rename and Number Layers
- Renames and numbers selected layers (text and non-text layers)
- Sorts layers by start time (inPoint)
- Supports name masks with `{num}` placeholder
- 4-digit numbering (0001, 0002, 0003...)
- **"Up" checkbox**: Inverts numbering and sorting order
  - When disabled: earliest inPoint → number 0001 (at top)
  - When enabled: earliest inPoint → highest number (at bottom)

## 🚀 Usage

### Tutorial Video

📹 **Watch the tutorial**: [SplitText v1.2 Tutorial](https://youtu.be/gjr6Doi_EwE)

### Installation
1. Copy the `SplitText v1.2.jsx` file to the After Effects scripts folder:
   - **Windows**: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts\`
   - **Mac**: `/Applications/Adobe After Effects [version]/Scripts/`

2. Run the script through After Effects menu:
   - **File** → **Scripts** → **Run Script File...**
   - Or use the **Window** → **Scripts** panel

### Interface

#### "Actions" Panel
- **Split into Layers** - splits text into two separate layers
- **Split into Lines** - splits text into two lines in the same layer

#### "Options" Panel
- **Split into Layers by Lines** - when enabled, "Split into Layers" divides text by lines (each line becomes a separate layer)
- **Split at Layer Middle** - automatically split at the middle of layer duration
- **Use Split Symbol** - use a split symbol (specified in the field below)
- **Split Symbol** - field for entering the split symbol (default: `$`)

#### "Rename and Number Layers" Panel
- **Name Mask** - mask for layer name (you can use `{num}` for the number)
- **Rename & Number Layers** - button for renaming and numbering
- **Up** - checkbox to invert numbering and sorting order
  - **Disabled (default)**: Earliest inPoint gets number 0001 and is placed at top
  - **Enabled**: Earliest inPoint gets highest number and is placed at bottom

## 📋 Formatting Rules

The script uses intelligent rules to prevent incorrect text splitting:

### 1. Words that should not be at the end of a line
- **ONLY**: prepositions, articles, conjunctions, pronouns (Russian and English)
- **DOES NOT include**: auxiliary verbs, adverbs, quantifiers (removed in v1.2 to eliminate conflicts)

### 2. Words that are never split
- Abbreviations ("т.е.", "и т.д.", "etc.", "e.g.", etc.)
- Units of measurement ("kg", "km", "sec", "min", etc.)
- Combinations of abbreviations with numbers ("рис. 1", "стр. 5")

### 3. Compound Expressions
- **ONLY**: multi-word prepositions, geographical names, companies
- **DOES NOT include**: "subject+verb" pairs like "i have", "we will" (removed in v1.2 to eliminate conflicts)
- Phraseological constructions ("так как", "потому что", "in order to", "according to", etc.)
- Geographical names:
  - Cities: "New York", "Los Angeles", "Нижний Новгород", "Великий Новгород", etc.
  - Regions: "New South Wales", "British Columbia", "Республика Саха", etc.
- Companies and brands:
  - "General Motors", "Goldman Sachs", "Альфа Банк", "Яндекс Такси", etc.

### 4. Special Characters
- Opening characters: `"`, `'`, `(`, `[`, `{`, `«`
- Special characters: `,`, `.`, `!`, `?`, `:`, `;`

## 🔧 Technical Details

### Supported Line Break Types
- `\r\n` (CRLF - Windows)
- `\r` (CR - old Mac)
- `\n` (LF - Unix/Linux)

### Split Priorities
1. **"Split into Layers by Lines" mode** (if enabled): Simple line-by-line splitting - each line becomes a separate layer
2. **Line breaks** (only for "Split into Layers" when "Split into Layers by Lines" is disabled)
3. **Split symbol** (if "Use Split Symbol" checkbox is enabled)
4. **Automatic search** - nearest space to the middle of the text with respect to rules

### Formatting Rules Application Order (for automatic search)
1. **Compound expressions** (multi-word prepositions, geographical names, companies) - priority #1
2. **Words from avoidEndWords** (prepositions, articles, conjunctions, pronouns) - priority #2
3. **Words that are never split** (abbreviations, units of measurement) - priority #3
4. **Special terms** (cities, brands) - priority #4
5. **Basic rules** (opening characters, special characters) - priority #5

### Multiple Layer Selection
- When selecting multiple layers for "Split into Layers" - splitting occurs at the middle of each layer's duration
- When selecting multiple layers for "Split into Lines" - each layer is processed separately
- When renaming - all selected layers are renamed and sorted by `inPoint`

### Layer Renaming
- If the mask contains `{num}` - it is replaced with a 4-digit number
- If `{num}` is not present - the number is added at the end
- **Numbering order depends on "Up" checkbox**:
  - **"Up" disabled**: Layers are numbered from earliest to latest inPoint (0001, 0002, 0003...)
  - **"Up" enabled**: Layers are numbered from latest to earliest inPoint (highest number for earliest inPoint)
- Examples (with "Up" disabled):
  - Mask: `"Text {num}"` → `"Text 0001"`, `"Text 0002"`
  - Mask: `"Scene"` → `"Scene 0001"`, `"Scene 0002"`

## ⚠️ Limitations

- The script works only with text layers for splitting
- All layer types are supported for renaming
- An active composition is required
- At least one selected layer is required

## 🐛 Known Issues

- For multiple selection in "Split into Layers", the middle of layer duration is always used (cursor position is not taken into account)
- Recursive line splitting may take time with a large number of lines

## 📚 Code Structure

A detailed map of all functions and data structures is available in [SCRIPT_MAP.md](SCRIPT_MAP.md).

### Main Components:
1. **UI initialization** (lines 1-85)
2. **Data arrays** (lines 91-243)
3. **Validation functions** (lines 248-283, 1002-1047)
4. **Splitting functions** (lines 288-621)
5. **Formatting rules functions** (lines 626-978)
6. **Renaming functions** (lines 1052-1177)
7. **Event handlers** (lines 1182-1195)

### Additional Documentation:
- **[SCRIPT_MAP.md](Documentation/SCRIPT_MAP.md)** - Map of all functions with line numbers

## 🔄 Version History

### v1.2
- **Critical fix**: Cleaned up `avoidEndWords` and `compoundExpressions` lists to eliminate conflicts
  - Removed auxiliary verbs, adverbs, quantifiers from `avoidEndWords`
  - Removed "subject+verb" pairs from `compoundExpressions`
  - Now "I have a dream" correctly splits into "I have" + "a dream"
- Simplified compound expression checking logic
- Improved `findCompoundSafePosition` function for more accurate position search
- Fixed `lineSplitInfo.position` check in `updateLayerText`
- **Added "Up" checkbox** for inverted numbering and sorting order
  - When enabled: earliest inPoint gets highest number and is placed at bottom
  - Fixed numbering to follow chronological order of inPoints
- **Added "Split into Layers by Lines" checkbox** for simple line-by-line splitting
  - When enabled: "Split into Layers" divides text by lines - each line becomes a separate layer
  - Ignores formatting rules and simply splits at line breaks
- All alert messages translated to English
- Removed debug messages
- Updated documentation

### v1.1
- Added support for multiple layer selection
- Added layer renaming and numbering function
- Extended formatting rules (geographical names, companies)
- Improved line break handling
- Added recursive processing of multiple lines

### v1.0
- Initial version
- Basic text splitting
- Basic formatting rules

## 📞 Contact

**Email**: tannenspiel@gmail.com

## 📄 License

The script is provided "as is" without any warranties.




