/**
 *  Konstruktor, richtet das SearchMacro-Objekt ein.
 *  SearchMacro fuerht Suchanfragen aus und stellt das Ergebnis dar.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classComponent.js 
 *      classDom.js 
 *      classWaitDialog.js
 */
var SearchMacro = function() {
};

/** Ableitung von Component.*/
SearchMacro.prototype = Component;

/** Aufbereitete Rohdaten der Kaptitel */
SearchMacro.prototype.chapters;

/** Suchanfrage */
SearchMacro.prototype.query;

/** HTML-Struktur der Ergebnisse */
SearchMacro.prototype.result;

/** Anzahl der ermittelten Ergebnisse */
SearchMacro.prototype.count;

/** Ausfuehrungszeit der Suche */
SearchMacro.prototype.timing;

/** Bindet die Klasse als Component ein. */
SearchMacro.bind = Component.bind;

/** Konstante Klammer oeffnened */
SearchMacro.OPENING = "(";

/** Konstante Klammer schliessend */
SearchMacro.CLOSING = ")";

/** Konstante logischer Operator Und */
SearchMacro.AND = "+";

/** Konstante logischer Operator Oder */
SearchMacro.OR = "|";

/** Konstante logischer Operator Nicht */
SearchMacro.NOT = "-";

/** Konstante der Zeichengruppe Delimiters */
SearchMacro.DELIMITERS = new Array(" ");

/** Konstante der Zeichengruppe Literal */
SearchMacro.LITERALS = new Array("'", "\"");

/** Konstante der Zeichengruppe Logic */
SearchMacro.LOGICS = new Array(SearchMacro.AND, SearchMacro.OR, SearchMacro.NOT);

/** Konstante der Zeichengruppe Separator */
SearchMacro.SEPARATORS = new Array(SearchMacro.OPENING, SearchMacro.CLOSING);

/** Konstante vom Zeichentyp Neutral */
SearchMacro.NEUTRAL = 0;

/** Konstante vom Zeichentyp Literal */
SearchMacro.LITERAL = 1;

/** Konstante vom Zeichentyp Logic */
SearchMacro.LOGIC = 2;

/** Konstante vom Zeichentyp Separator */
SearchMacro.SEPARATOR = 3;

/** maximale Laenge vom Vorschautext */
SearchMacro.PREVIEW_LENGTH = 500;

/**
 *  Maskiert die HTML-Struktur beeinflussenden Steuerzeichen im uebergebenen
 *  Text. Rueckgabe der Text mit maskierten Steuerzeichen.
 *  @param  text zu maskierender Text
 *  @return der Text mit maskierten Steuerzeichen.
 */
SearchMacro.escapeHtml = function(text) {

    text = (text == null) ? "" : String(text);

    text = text.replace(/&/g, "&amp;");
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    text = text.replace(/"/g, "&#34;");
    text = text.replace(/'/g, "&#39;");

    return text;
};

/** Setzt den Fokus in das erste Eingabefeld. */
SearchMacro.focus = function() {

    var element;

    element = Dom.getElementsByTagName(document.getElementById("ContentView"), "button");

    if (element && element.length) element[0].focus();

    element = Dom.getElementsByTagName(document.getElementById("ContentView"), "input");

    if (element && element.length) element[0].focus();
};

/**
 *  Belegt die Suche und das Ergebnis in der aktuellen Ansicht und wird
 *  intern parametriesiert zum Belegen der Felder verwendet.
 */
SearchMacro.prepare = function() {

    window.setTimeout(SearchMacro.focus, 250);
};

/**
 *  Belegt die Suche und das Ergebnis in der aktuellen Ansicht und wird
 *  intern parametriesiert zum Belegen der Felder verwendet.
 *  @param field Feld
 *  @param value Wert
 */
SearchMacro.show = function(field, value) {

    var element;
    var elements;
    var loop;
    var query;
    var entries;
    var empty;

    SearchMacro.bind();

    if (!field) {

        WaitDialog.show();
        
        query = SearchMacro.instance.query && SearchMacro.instance.query.replace(/^\s+|\s+$/g, '').length > 0;
        empty = !SearchMacro.instance.result || SearchMacro.instance.result.length <= 0;
        
        SearchMacro.show("SearchMacroQueryString", SearchMacro.instance.query ||"");
        SearchMacro.show("SearchMacroExecuteButton", false);
        
        SearchMacro.show("SearchMacroEmpty", empty ? "block" : "none");
        SearchMacro.show("SearchMacroHelp", empty ? "block" : "none");
        SearchMacro.show("SearchMacroResult", empty ? "none" : "block");
        
        SearchMacro.show("SearchMacroResultCount", SearchMacro.instance.result ? SearchMacro.instance.count : 0);
        SearchMacro.show("SearchMacroResultTime", SearchMacro.instance.timing ? SearchMacro.instance.timing /1000 : 0);
        SearchMacro.show("SearchMacroResultContent", SearchMacro.instance.result || "");

        WaitDialog.hide();

        window.setTimeout(SearchMacro.focus, 250);

        return;
    }

    entries = new Array();

    elements = document.getElementsByName(field);

    for (loop = elements.length; loop > 0; loop--) {

        entries[entries.length] = elements[loop -1];
    }

    element = document.getElementById(field);

    if (element) entries[entries.length] = element;

    for (loop = entries.length; loop > 0; loop--) {

        switch (field) {

            case "SearchMacroResultTime":
            case "SearchMacroResultContent":
            case "SearchMacroResultCount":
                entries[loop -1].innerHTML = value;
                break;

            case "SearchMacroEmpty":
            case "SearchMacroHelp":
            case "SearchMacroResult":
                entries[loop -1].style.display = value;
                break;

            case "SearchMacroExecuteButton":
                entries[loop -1].disabled = value;
                break;

            case "SearchMacroQueryString":
                entries[loop -1].value = value;
                break;
        }
    }
};

/**
 *  Erstellt aus der Suchanfrage logisch verkettetes JavaScript.
 *  @param  query Suchanfrage
 *  @return das erstellte JavaScript
 */
SearchMacro.buildExpression = function(query) {

    var cache;
    var entry;
    var loop;
    var type;
    var result;
    var shadow;

    //die Steuerzeichen werden entfernt, die logischen und operativen
    //Steuerzeichen werden gekennzeichnet nicht aber in den Literalen
    query = query.replace(/\01/g, ' ');
    query = query.replace(/('.*?\s+.*?'|".*?\s+.*?")|([\(\)\+\|\-\s])/g, '$1\01$2\01');
    query = query.split("\01");

    for (loop = 0, result = ""; loop < query.length; loop++) {

        entry = query[loop].replace(/^\s+|\s+$/g, '');

        if (!entry || entry.length == 0) continue;

        type = entry.charAt(0);

        //der Typ vom Fragment wird ermittelt
        if (SearchMacro.LITERALS.join("").indexOf(type) >= 0) type = SearchMacro.LITERAL;
        else if (SearchMacro.LOGICS.join("").indexOf(type) >= 0) type = SearchMacro.LOGIC;
        else if (SearchMacro.SEPARATORS.join("").indexOf(type) >= 0) type = SearchMacro.SEPARATOR;
        else type = SearchMacro.NEUTRAL;

        if (type == SearchMacro.LITERAL || type == SearchMacro.NEUTRAL) {

            if (type == SearchMacro.LITERAL) entry = entry.substring(1, entry.length -1);

            //die Platzhalter werden in Expressions geaendert
            entry = entry.replace(/\*/g, '\01');
            entry = entry.replace(/(\W)/g, '\\$1');

            if (entry.substring(0, 2) != "\\\01") entry = "(^|\\W{1,})" + entry;
            if (entry.substring(entry.length -2) != "\\\01") entry += "($|\\W{1,})";

            entry = entry.replace(/^\\\01+|\\\01+$/g, '');
            entry = entry.replace(/\\\01/g, '\.\*\?');

            if (shadow == SearchMacro.LITERAL || shadow == SearchMacro.NEUTRAL) result += " &&";

            result += " new RegExp(\"" + entry + "\", \"gim\").test(content)";

        } else {

            //aus Tolleranz wird die Und-Verknuepfung automatisch vor
            //sowie nach Klammer und Literalen gesetzt
            if ((shadow == SearchMacro.LITERAL || shadow == SearchMacro.NEUTRAL) && (type == SearchMacro.SEPARATOR || entry == SearchMacro.NOT) && entry != SearchMacro.CLOSING) result += " &&";
            if (cache == SearchMacro.CLOSING && entry == SearchMacro.NOT) result += " &&";

            if (entry == SearchMacro.AND) entry = "&&";
            if (entry == SearchMacro.OR)  entry = "||";
            if (entry == SearchMacro.NOT) entry = "!";

            result += " " + entry;
        }

        shadow = type;
        cache  = entry;
    }

    return result;
};

/**
 *  Aufruf einer asynchronenen Suche in einem Kapitel.
 *  @param chapter Kapitel
 *  @param query   Suchanfrage
 */
SearchMacro.search = function(chapter, query) {

    window.setTimeout(function() {SearchMacro.searchTask(chapter, query);}, 25);
};

/**
 *  Maskiert alle RegExp-spezifischen Steuerzeichen.
 *  @param  text zu maskierender Text
 *  @return der maskierte Text
 */
SearchMacro.escapeRegExp = function(text) {

    return text ? text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : text;
};

/**
 *  Ermittelt alle Vorkommen des angegebenen Muster im Suchtext.
 *  @param  word    Muster
 *  @param  content Suchtext
 *  @return die ermittelten Vorkommen als Array
 */
SearchMacro.indexWord = function(word, content) {

    var index;

    index = new Array();
    word  = SearchMacro.escapeRegExp(word);
    
    content.replace(new RegExp("\\b" + word + "\\b", "gim"), function(match, cursor, input) {

        index[index.length] = cursor;

        return match;
    });
    
    if (index.length) return index;
    
    content.replace(new RegExp(word, "gim"), function(match, cursor, input) {

        index[index.length] = cursor;

        return match;
    });

    return index;
};

/**
 *  Ermittelt alle Vorkommen der angegebenen Muster im Suchtext.
 *  @param  words   Muster als Array
 *  @param  content Suchtext
 *  @return die ermittelten Vorkommen als mehrdimensionales Array
 */
SearchMacro.indexWords = function(words, content) {

    var index;
    var loop;
    var search;

    index = new Array();
    
    for (loop = 0; words && loop < words.length; loop++) {
    
        search = SearchMacro.indexWord(words[loop], content);
        
        if (!search || !search.length) continue;
        
        index[index.length] = SearchMacro.indexWord(words[loop], content);
    }

    return index;
};

/**
 *  Ermittelt den maximalen Abstand vom ersten Vorkommen aller gefundenen Muster
 *  im Suchtext zu einem der Muster.
 *  @param index Bezugsmusters im Index ab dem die Abstaende zu den anderen
 *               Muster berechnet wird.
 *  @param range Vorkommen aller Muster als mehrdimensionales Array
 */
SearchMacro.matchRange = function(index, range) {

    var loop;
    var offset;

    for (loop = 0, offset = -1; loop < range.length; loop++) {
    
        if (index == loop) continue;
        
        if (range[loop][0] < range[index][0]) return -1;
        
        offset = Math.max(offset, range[loop][0] -range[index][0]);
    }

    return offset;
};

/**
 *  Berechnet den kleinsten Bereich eines mehrdimensionales Arrays.
 *  @param index mehrdimensionales Arrays
 *  @param der ermittelte Bereich als annonymes Objekt.
 */
SearchMacro.computeRange = function(index) {

    var loop;
    var left;
    var right;
    var width;
    
    //keine Index, keine Position
    if (!index || !index.length) return null;
    
    //nur ein Index, erste Position
    if (index.length == 1) return {left:index[0][0], right:index[0][0]};

    right = 0;
    left  = 0;
    
    while (true) {
        
        for (loop = 0; loop < index.length; loop++) {
        
            width = SearchMacro.matchRange(loop, index);
            
            if (width > 0 && (width < right -left || right == 0)) {left = index[loop][0]; right = left +width;}
        }

        //Verkuerzen der Positionen, um die Folgeabstaende zu berechnen
        //liegen keine Daten mehr vor, ist keine Berechnung mehr moeglich
        for (loop = 0; loop < index.length; loop++) {
        
            index[loop].shift();
            
            if (!index[loop].length) return {left:left, right:right};
        }
    }

    return null;
};

/**
 *  Ermittelt den Vorschautext.
 *  @param  range   Bereicht vom Textfund
 *  @param  content Suchtext
 *  @return der ermittelte Vorschautext
 */
SearchMacro.computePreview = function(range, content) {

    var left;
    var right;
    var match;
    var text;
    var size;
    
    //der Textfund wird ermittelt
    text = content.substring(range.left, range.right);
    
    //das Satzende wird ermittelt
    right = content.substring(range.right);
    match = right.match(/(.*?[\.\?\!])(?:\s+[A-Z])/);
    right = match && match.length ? match[1] : right;
    
    //der Anfang richtet sich nach der Laenge vom Textfund und Satzende, unter
    //der Quote 1/3 wird das erste Substantiv, sonst der Satzanfang verwendet
    left = content.substring(0, range.left);
    
    if (right.length > SearchMacro.PREVIEW_LENGTH /2.3) {
    
        match = left.match(/.*(?:(?:[\!\?\.]\s+)|(?:\b))([A-Z].*)$/);
        left  = match && match.length ? match[1] : left;
    
    } else {
    
        match = left.match(/.*(?:[\!\?\.]\s+)([A-Z].*)$/);
        left  = match && match.length ? match[1] : left;
    }
    
    //Satzanfang und Textfund werden zusammengesetzt
    text = left + text;
    
    if (text.length + right.length > SearchMacro.PREVIEW_LENGTH) {
    
        size  = SearchMacro.PREVIEW_LENGTH -text.length;
        match = right.match(new RegExp("(.{" + size + "}.)\\b"));
        right = match && match.length ? match[1] + "..." : right;
    }
    
    return text + right;
};

/**
 *  Durchsucht ein Kapitel entsprechend der Suchanfrage.
 *  @param chapter Kapitel
 *  @param query   Suchanfrage
 */
SearchMacro.searchTask = function(chapter, query) {

    var index;
    var loop;
    var words;
    var range;

    if (chapter.content == null) {

        //Element zur Aufloesung von HTML-Sonderzeichen
        words = document.createElement("div");

        //der Index im Toc wird ermittelt
        chapter.index = Toc.get((chapter.index *4) +1);

        //der aufbereitete Inhalt des Kapitels wird ermittelt
        content = Parser.getChapter(chapter.index, true);

        //Zeilenumbrueche werden komplett entfernt
        content = content.replace(/(\r\n)|(\n\r)|\r|\n/g, ' ');

        //das Kapitel-Objekt wird befuellt
        chapter.title = content.match(/<h\d.*?>(.*?)<\/h\d.*?>/i)[1];

        words.innerHTML = chapter.title;
        chapter.title   = words.innerText == null ? words.textContent : words.innerText;

        index = content.search(/<\/h\d.*?>/i);

        content = (index >= 0) ? content.substring(index) : "";

        content = content.replace(/<.*?>/g, ' ');
        content = content.replace(/\s{2,}/g, ' ');
        content = content.replace(/^\s+|\s+$/g, '');

        chapter.content = content;

        words.innerHTML = chapter.content;
        chapter.content = words.innerText == null ? words.textContent : words.innerText;
    }

    content = chapter.title + " " + chapter.content;

    //die eigentliche Suche wird ueber Titel und Inhalt ausgefuehrt
    try {if (!eval(query)) chapter.offset = -1;
    } catch (exception) {

        chapter.offset = -1;
    }

    if (chapter.offset < 0) return;

    SearchMacro.bind();

    //die Woerter des Suche werden ermittelt, es wird hier von einem positiven
    //Verlauf ausgegangen, da die Woerter bereits im Vorfeld ermittelt wurden,
    //muessen diese im Text entsprechende Positionen besetzen
    words = SearchMacro.instance.query.match(/[\w]{1,}/g);
    
    //Jedes Word hat eine Position im Suchtext.
    //  B---t--------------------------t----------------t-----------------------
    //  A-c-------------------------c---------------------c---------c----------c
    //  C-----------------------------i---------------------i-------------------
    //  D---------------z-----------------------------------z----------------z--

    //Es werden daher alle Positionen eines Wortes als Array ermittelt.
    //Die ermittelten Positionen werden dann in einem mehrdimensionalen Array
    //zusammengefuehrt. Im Folgeschritt werden die kuerzestem Abstaende der
    //der Worte ermittelt, welche dann den Preview-Bereich definieren.
    index = SearchMacro.indexWords(words, chapter.content);
    range = SearchMacro.computeRange(index, chapter.content);   
    
    chapter.preview = SearchMacro.computePreview(range || {left:0, right:0}, chapter.content);
    
    //der Offset fuer die Que wird gesetzt
    chapter.offset = 0;
};

/**
 *  Erstellt den Titel zum Kapitel.
 *  @param  chapter Kapitel
 *  @return Titel zum Kapitel
 */
SearchMacro.buildTitle = function(chapter) {

    return "<h5><a onclick=\"ContentView.show('" + chapter.index + "')\">" + SearchMacro.escapeHtml(chapter.title) + "</a></h5>";
};

/**
 *  Erstellt ab Ebene 2 die Brotkrumennavigation zum Kapitel.
 *  @param  chapter Kapitel
 *  @return Brotkrumennavigation zum Kapitel
 */
SearchMacro.buildCrumbs = function(chapter) {

    var result;
    var level;
    var index;
    var entry;
    var cursor;
    
    level = chapter.index.split(".");
    
    if (level.length < 2) return "";

    result = "<h6>";
    
    for (cursor = 0; cursor < level.length -1; cursor++) {
    
        index = Toc.indexOf(level.slice(0, cursor +1).join("."));
        entry = SearchMacro.instance.chapters[index /4];
        
        if (cursor > 0) result += " - ";
        
        result += "<a onclick=\"ContentView.show('" + entry.index + "')\">" + SearchMacro.escapeHtml(entry.title) + "<\/a>";
    }
    
    result += "</h6>";

    return result;
};

/**
 *  Erstellt den Vorschautext zum Kapitel.
 *  @param  chapter Kapitel
 *  @return Vorschautext zum Kapitel
 */
SearchMacro.buildText = function(chapter) {

    if (!chapter.preview) return "";

    //das Ergebnis wird komplett als HTML hinzugefuegt
    return "<p>" + SearchMacro.escapeHtml(chapter.preview) + "</p>";
};

/**
 *  Wartet auf die Ausfuehrung aller asynchroner Suchanfragen und erstellt
 *  das finale Suchergebnis.
 *  @param timing Startzeit
 */
SearchMacro.waitTask = function(timing) {

    var count;
    var cursor;
    var entry;
    var index;
    var level;
    var loop;

    SearchMacro.bind();

    for (loop = 0; loop < SearchMacro.instance.chapters.length; loop++) {

        if (SearchMacro.instance.chapters[loop].offset == null) {

            window.setTimeout(function() {SearchMacro.waitTask(timing);}, 25);

            return;
        }
    }

    //das Ergebnis wird zurueckgesetzt
    SearchMacro.instance.result = "";

    //die Kapitel werden gezaehlt und die uebergeordneten ggf. markiert
    for (loop = 0, count = 0; loop < SearchMacro.instance.chapters.length; loop++) {

        entry = SearchMacro.instance.chapters[loop];

        if (entry.offset != 0) continue;

        count++;

        SearchMacro.instance.result += SearchMacro.buildTitle(entry);
        SearchMacro.instance.result += SearchMacro.buildCrumbs(entry);
        SearchMacro.instance.result += SearchMacro.buildText(entry);
    }

    //die Ausfuehrungszeit wird ermittelt
    SearchMacro.instance.timing = new Date().getTime() -timing;

    //die Anzahl der realen Ergebnisse wird gesetzt
    SearchMacro.instance.count = count;

    window.setTimeout(function() {SearchMacro.show();}, 25);
};

/**
 *  Asynchroner Einsprung zur Suche.
 *  @param query Suchanfragen
 */
SearchMacro.executeTask = function(query) {

    var chapter;
    var loop;
    var timing;

    SearchMacro.bind();

    timing = new Date().getTime();

    query = SearchMacro.buildExpression(query).replace(/\\/g, '\\\\');

    //ggf. wird der Kapitel-Cache eingerichtet
    if (!SearchMacro.instance.chapters) SearchMacro.instance.chapters = new Array(Toc.size() /4);

    //die eigentliche Suche erfolgt asynchron, dazu wird ein Array fuer
    //das komplette Inhaltsverzeichnis aufgebaut und darin jeweils ein
    //Kapitel plaziert, ein Thread wartet nun darauf das bei diesem
    //Kapitel das Feld offset gesetzt wird, es nach der Suche groesser
    //oder kleiner 0 wenn das Suchmuster nicht greift
    for (loop = 0; loop < SearchMacro.instance.chapters.length; loop++) {

        chapter = SearchMacro.instance.chapters[loop];

        if (chapter == null) {

            chapter = new Chapter();

            chapter.index = loop;

            SearchMacro.instance.chapters[loop] = chapter;
        }

        SearchMacro.instance.chapters[loop].offset = null;

        SearchMacro.search(chapter, query);
    }

    window.setTimeout(function() {SearchMacro.waitTask(timing);}, 250);
};

/**
 *  Einsprung zur Suche.
 *  @param query Suchanfragen
 */
SearchMacro.execute = function(query) {

    var elements;
    var loop;
    var query;
    
    SearchMacro.bind();
    
    query = query ? query.value.replace(/^\s+|\s+$/g, '') : "";

    if (!query) {
    
        query = document.getElementsByName("SearchMacroQueryString");
        query = query ? query[0].value.replace(/^\s+|\s+$/g, '') : null;       
    }

    if (!query || query.length == 0) return;
    
    SearchMacro.instance.query = query;

    WaitDialog.show();

    elements = document.getElementsByName("SearchMacroExecuteButton");

    for (loop = elements.length; loop > 0; loop--) {

        elements[loop -1].disabled = true;
    }

    window.setTimeout(function() {SearchMacro.executeTask(query);}, 25);
};