/**
 *  Konstruktor, richtet das WikiSyntax-Objekt ein.
 *  WikiSyntax stellt den Interpreter fuer die Wiki-Syntax bereit.
 *  Der Interpreter registriert sich selbststaendig ueber Syntax beim beim
 *  Parser, wenn der aktuelle Dialekt zum Interpreter passt.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classSyntax.js
 *      classToc.js  
 */
var WikiSyntax = function() {

    //Dialekt des Interpreters
    this.dialect = "wiki";
};

/** Ableitung vom WikiSyntax.*/
WikiSyntax.prototype = Interpreter;

/** Liste der Inhalte von Ausschluessen */
WikiSyntax.prototype.excludes;

/** Tiefe beim parsen von Strukturen */
WikiSyntax.prototype.deep;

/** Letztes Muster beim parsen von Strukturen */
WikiSyntax.prototype.shadow;

/** Index der textuellen Grenzen zur Berarbeitung */
WikiSyntax.prototype.markers;

/** Einsprung zur Befuellen der Platzhalter. */
WikiSyntax.onBuildData = Interpreter.onBuildData;

/** Rueckgabe der Liste mit den  fertig erstellen Kapiteln. */
WikiSyntax.getBuilds = Interpreter.getBuilds;

/** Rueckgabe der Liste mit erstellen Rohdaten der Kapitel. */
WikiSyntax.getChapters = Interpreter.getChapters;

/** Bindet die aktuelle Instanz ein. */
WikiSyntax.bind = Interpreter.bind;

/** Initialisiert den Interpreter und registriert ihn ggf. fuer die Wiki-Syntax. */
WikiSyntax.initialize = Interpreter.initialize;

/** Erstellt ein neues (Roh)Kapitels und registiert den TOC-Eintrag. */
WikiSyntax.createChapter = Interpreter.createChapter;

/**
 *  Einsprung zur Markierung eines Ausschlusses.
 *  @param  match   Suchergebnis
 *  @param  exclude Ausschluss
 *  @param  offset  Fundstelle im durchsuchten Text
 *  @param  block   durchsuchter Text
 *  @return die Markierung eines Ausschlusses
 */
WikiSyntax.onBuildExclude = function(match, exclude, offset, block) {

    WikiSyntax.bind();

    if (!WikiSyntax.instance.excludes) WikiSyntax.instance.excludes = new Array();

    WikiSyntax.instance.excludes[WikiSyntax.instance.excludes.length] = exclude;

    return "\01" + (WikiSyntax.instance.excludes.length -1) + "\01";
};

/**
 *  Einsprung zum Entfernen einer Passage.
 *  @param  match  Suchergebnis
 *  @param  offset Fundstelle im durchsuchten Text
 *  @param  block  durchsuchter Text
 *  @return der Platzhalter zur Passage
 */
WikiSyntax.onBuildSwap = function(match, offset, block) {

    block = match.length;
    match = " ";

    while (match.length < block) match += match.length < 65535 ? match : match.substring(0, 65535);

    return match.substring(0, block);
};

/**
 *  Einsprung zum Markieren eines (Roh)Kapitels.
 *  @param  match   Suchergebnis
 *  @param  marker  Option Kennzeichnung
 *  @param  format  Format
 *  @param  style   CSS-Klasse
 *  @param  options zusaetzliche Attribute
 *  @param  alias   Alias
 *  @param  title   Titel
 *  @param  offset  Fundstelle im durchsuchten Text
 *  @param  block   durchsuchter Text
 *  @return die Syntax des markierten Kapitels
 */
WikiSyntax.onBuildMark = function(match, marker, format, ignore, style, ignore, options, ignore, alias, title, offset, block) {

    return (match.match(/^\s*={3,}/) ? "\06" : "\07") + match;
};

/**
 *  Einsprung zur Erstellung eines (Roh)Kapitels mit TOC-Eintrag.
 *  Dabei wird nur der Title und die HTML-Grundstruktur gebildet.
 *  @param  match   Suchergebnis
 *  @param  limited Option fuer Kapitel ohne Unterkapitel
 *  @param  format  Format
 *  @param  style   CSS-Klasse
 *  @param  options zusaetzliche Attribute
 *  @param  alias   Alias
 *  @param  title   Titel
 *  @param  offset  Fundstelle im durchsuchten Text
 *  @param  block   durchsuchter Text
 *  @return die HTML-Syntax zum Wiki-Element
 */
WikiSyntax.onBuildChapter = function(match, limited, format, ignore, style, ignore, options, ignore, alias, title, offset, block) {

    return WikiSyntax.createChapter(match.search(/(?!=)/) -1, limited, format, title, alias, style, options, "\07");
};

/**
 *  Einsprung zur Erstellung eines Links/Bilds.
 *  @param  match   Suchergebnis
 *  @param  content Inhalt zum Link/Bild
 *  @param  offset  Fundstelle im durchsuchten Text
 *  @param  block   durchsuchter Text
 *  @return die HTML-Syntax zum Wiki-Element
 */
WikiSyntax.onBuildLink = function(match, content, offset, block) {

    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?((ftp|http|https):)(.*?)(\|(.*?))\]\]/ig, '<a $4 class=\"link $2\" href=\"$5$7" target=\"_blank\">$9<\/a>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?((ftp|http|https):)(.*?)\]\]/ig, '<a $4 class=\"link $2\" href=\"$5$7" target=\"_blank\">$5$7<\/a>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?((file):)(.*?)(\|(.*?))\]\]/ig, '<a $4 class=\"link $2\" href=\"$7" target=\"_blank\">$9<\/a>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?((file):)(.*?)\]\]/ig, '<a $4 class=\"link $2\" href=\"$7" target=\"_blank\">$5$7<\/a>');

    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?((mail):)(.*?)(\|(.*?))\]\]/ig, '<a $4 class=\"link $2\" href=\"mailto:$7">$9<\/a>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?((mail):)(.*?)\]\]/ig, '<a $4 class=\"link $2\" href=\"mailto:$7">$7<\/a>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(image:)(.*?)(\|(.*?))\]\]/ig, '<img $4 class=\"$2\" src=\"$6" title=\"$8\"><br><span class="title $2">$8<\/span>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(image:)(.*?)\]\]/ig, '<img $4 class=\"$2\" src=\"$6">');

    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(media:)(.*?):nostart(\|(.*?))\]\]/ig, '<embed $4 class=\"$2\" src=\"$6\" autostart=\"false\" loop=\"true\" hiden=\"false\" title=\"$8\"><br><span class="title $2">$8<\/span>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(media:)(.*?):nostart\]\]/ig, '<embed $4 class=\"$2\" src=\"$6\" autostart=\"false\" loop=\"true\" hiden=\"false\" title=\"\">');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(media:)(.*?):hiden(\|(.*?))?\]\]/ig, '<embed $4 class=\"$2\" src=\"$6\" autostart=\"true\" loop=\"true\" hiden=\"true\" title=\"$8\"><br><span class="title $2">$8<\/span>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(media:)(.*?):hiden\]\]/ig, '<embed $4 class=\"$2\" src=\"$6\" autostart=\"true\" loop=\"true\" hiden=\"true\" title=\"\">');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(media:)(.*?)(\|(.*?))\]\]/ig, '<embed $4 class=\"$2\" src=\"$6\" autostart=\"true\" loop=\"true\" hiden=\"false\" title=\"$8\"><br><span class="title $2">$8<\/span>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(media:)(.*?)\]\]/ig, '<embed $4 class=\"$2\" src=\"$6\" autostart=\"true\" loop=\"true\" hiden=\"false\" title=\"\">');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)(\|(.*?))\]\]/g, '<a $4 class=\"link $2\" onclick="ContentView.show(\'$5\')\">$7<\/a>');
    match = match.replace(/\[\[(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)\]\]/g, '<a $4 class=\"link $2\" onclick="ContentView.show(\'$5\')\">$5<\/a>');

    WikiSyntax.bind();

    if (!WikiSyntax.instance.excludes) WikiSyntax.instance.excludes = new Array();

    WikiSyntax.instance.excludes[WikiSyntax.instance.excludes.length] = match;

    return "\01" + (WikiSyntax.instance.excludes.length -1) + "\01";
};

/**
 *  Einsprung zum Einbetten von Freitext.
 *  @param  match  Suchergebnis
 *  @param  index  Index
 *  @param  offset Fundstelle im durchsuchten Text
 *  @param  block  durchsuchter Text
 *  @return die HTML-Syntax zum Wiki-Element
 */
WikiSyntax.onBuildInclude = function(match, index, offset, block) {

    WikiSyntax.bind();

    return (index >= 0 && index < WikiSyntax.instance.excludes.length) ? WikiSyntax.instance.excludes[index] : "";
};

/**
 *  Einsprung zur Erstellung einer Liste.
 *  @param match   Suchergebnis
 *  @param symbol  Symbol
 *  @param style   CSS-Klasse
 *  @param options zusaetzliche Attribute
 *  @param offset  Fundstelle im durchsuchten Text
 *  @param block   durchsuchter Text
 *  @return die HTML-Syntax zum Wiki-Element
 */
WikiSyntax.onBuildList = function(match, symbol, ignore, style, ignore, options, offset, block) {

    var deep;
    var offset;
    var result;
    var string;
    var type;

    WikiSyntax.bind();

    if (!options) options = "";
    if (!style)   style   = "";
    if (!symbol)  symbol  = "";

    deep = symbol.length;
    type = symbol.substring(0, 1);

    if (!WikiSyntax.instance.deep) WikiSyntax.instance.deep = 0;

    if (WikiSyntax.instance.deep <= 0 && deep <= 0) return match;

    result = "";

    //ggf. noch offene Strukturen werden geschlossen
    if (deep <= 0 || (WikiSyntax.instance.deep > 0 && WikiSyntax.instance.shadow && WikiSyntax.instance.shadow != type) || (WikiSyntax.instance.deep > deep)) {

        offset = (WikiSyntax.instance.deep > 0 && WikiSyntax.instance.shadow && WikiSyntax.instance.shadow != type) ? 0 : deep;
        string = (WikiSyntax.instance.deep > 0 && WikiSyntax.instance.shadow && WikiSyntax.instance.shadow != type) ? WikiSyntax.instance.shadow : symbol;
        string = (string == "#") ? "ol" : "ul";

        while (WikiSyntax.instance.deep > offset) {

            result += "<\/" + string + ">";

            WikiSyntax.instance.deep--;
        }
    }

    if (symbol.length == 0) return result += match;

    //der Typ (Liste/Aufzaehlung) wird ermittelt
    symbol = (type == "#") ? "ol" : "ul";

    //ggf. wird die neue Strukturen aufgebaut
    while (WikiSyntax.instance.deep < deep) {

        result += "<" + symbol + " " + options  + " class=\"" + style + "\"" + ">";

        WikiSyntax.instance.deep++;
    }

    result += "<li " + options  + " class=\"" + style + "\"" + ">";

    WikiSyntax.instance.shadow = type;

    return result;
};

/**
 *  Einsprung zur Erstellung einer Tabelle.
 *  @param  match     Suchergebnis
 *  @param  symbol    Symbol vom Tabellenfragment
 *  @param  style     CSS-Klasse
 *  @param  alignment Textausrichtung
 *  @param  options   zusaetzliche Attribute
 *  @param  offset    Fundstelle im durchsuchten Text
 *  @param  block     durchsuchter Text
 *  @return die HTML-Syntax zum Wiki-Element
 */
WikiSyntax.onBuildTable = function(match, symbol, ignore, style, alignment, ignore, options, offset, block) {

    var color;
    var colspan;
    var result;
    var shadow;

    WikiSyntax.bind();

    if (!options) options = "";
    if (!style)   style = "";

    if (!WikiSyntax.instance.shadow) WikiSyntax.instance.shadow = new Array();
    if (!WikiSyntax.instance.deep)   WikiSyntax.instance.deep   = new Array();

    //ohne begonnene Tabelle werden alle Folgesymbole ignoriert
    if (WikiSyntax.instance.deep.length == 0 && symbol != "[|") return match;

    //die Ausrichtung wird als CSS-Klasse vorangestellt
    style = ((alignment == "  ") ? "right" : (alignment == " ") ? "center" : "left") + " " + style;

    //die horizontale Laufweite (Colspan) wird ermittelt
    colspan = (symbol.match(/\|{2,}|\!{2,}/)) ? (symbol.length /2) : 1;

    shadow = WikiSyntax.instance.shadow.length == 0 ? "" : WikiSyntax.instance.shadow[WikiSyntax.instance.shadow.length -1];
    symbol = symbol.substring(0, 2);
    result = "";

    switch (symbol) {

        case "[|":

            result += "<table class=\"" + style + "\"";
            result += (options.length > 0) ? " " + options : "";
            result +=">";

            WikiSyntax.instance.shadow[WikiSyntax.instance.shadow.length] = "";
            WikiSyntax.instance.deep[WikiSyntax.instance.deep.length]     = -1;

            break;

        case "|-":

            if (shadow == "!!") result += "<\/th><\/tr>";
            if (shadow == "||") result += "<\/td><\/tr>";

            break;

        case "!!":

            if (shadow == "!!") result += "<\/th>";
            if (shadow == "||") result += "<\/td><\/tr>";
            if (shadow != "!!") result += "<tr>";

            result += "<th class=\"" + (color ? color : "");
            result += ((style) ? (color ? " " : "") + style : "") + "\"";
            result += (options.length > 0) ? " " + options : "";
            result += (colspan > 1) ? " colspan=\"" + colspan + "\"" : "";
            result +=">";

            break;

        case "||":

            if (shadow == "||") result += "<\/td>";
            if (shadow == "!!") result += "<\/th><\/tr>";
            if (shadow != "||") result += "<tr>";

            if (shadow != "||") WikiSyntax.instance.deep[WikiSyntax.instance.deep.length -1]++;

            color = (WikiSyntax.instance.deep[WikiSyntax.instance.deep.length -1] % 2) == 0 ? "light" : "dark";

            result += "<td class=\"" + (color ? color : "");
            result += ((style) ? (color ? " " : "") + style : "") + "\"";
            result += (options.length > 0) ? " " + options : "";
            result += (colspan) ? " colspan=\"" + colspan + "\"" : "";
            result +=">";

            break;

        case "|]":

            if (shadow == "||") result += "<\/td><\/tr>";
            if (shadow == "!!") result += "<\/th><\/tr>";

            result += "<\/table>";

            WikiSyntax.instance.shadow.pop();
            WikiSyntax.instance.deep.pop();

            break;

        default: return match;
    }

    if (symbol != "|]") WikiSyntax.instance.shadow[WikiSyntax.instance.shadow.length -1] = symbol;

    return result;
};

/**
 *  Formatiert den Inhalt des uebergebenen Kapitels.
 *  @param  content zu formatierender Inhalt
 *  @return der in HTML formatierte Inhalt
 */
WikiSyntax.buildChapter = function(content) {

    //Wiki-Format: ~~~ Zeilenfortfuehrung in der Folgezeile

    //die internen Direktiven werden aufgeloest
    content = content.replace(/[^~]~~~\02\s*/g, ' ');

    //Wiki-Format: [[Link|Titel]]

    content = content.replace(/\[\[(.*?)\]\]/g, WikiSyntax.onBuildLink);

    //Wiki-Format: *... Aufzaehlung
    //Wiki-Format: #... List

    WikiSyntax.instance.shadow = null;
    WikiSyntax.instance.deep   = null;

    content = content.replace(/\02\s*(\*{1,}|\#{1,})?(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?/g, WikiSyntax.onBuildList);

    //Wiki-Format: [|Tabelle!!Header|-||Zelle|]

    WikiSyntax.instance.shadow = null;
    WikiSyntax.instance.deep   = null;

    content = content.replace(/(\|{2,}|\!{2,}|\[\||\|\-|\|\])(([\w \t]*?)\!(?!\!))?( {1,2})?(\{(.*?)\})?/g, WikiSyntax.onBuildTable);

    //Wiki-Format: ["Zitat"]
    //Wiki-Format: [%Quelltext als Block%]
    //Wiki-Format: [+|Gruppierung|+]
    //Wiki-Format: [[Link/Bild/Media]]
    //Wiki-Format: [:individuell formatierter Block:]
    //Wiki-Format: **fett gedruckten Text**
    //Wiki-Format: //kursiver Text//
    //Wiki-Format: __unterstrichenen Text__
    //Wiki-Format: --durchgestrichenen Text--
    //Wiki-Format: %%Quelltext%%
    //Wiki-Format: normal^^hochgestellt^^
    //Wiki-Format: normal,,tiefgestellt,,
    //Wiki-Format: ::individuell formatierter Text::
    //Wiki-Format: --- horizontale Linie
    //Wiki-Format: \\ Zeilenumbruch

    content = content.replace(/\[\"(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?/g, '<blockquote $4 class="$2">');
    content = content.replace(/\[\%(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?/g, '<pre $4 class="$2">');
    content = content.replace(/\[\:(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?/g, '<div $4 class="$2">');
    content = content.replace(/\[\>(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?/g, '<dir $4 class="$2">');
    content = content.replace(/\[\+(([\w \t]*?)!)?\s*(\s*\{\s*(.*?)\})?\s*(\|(.*?)\|)/g, '<fieldset $4 class="$2"><legend $4 class="$2">$6<\/legend>');
    content = content.replace(/\[\+(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?/g, '<fieldset $4 class="$2">');
    content = content.replace(/\:\:(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)\:\:/g, '<span $4 class="$2">$5<\/span>');

    content = content.replace(/\"\]/g, '<\/blockquote>');
    content = content.replace(/\%\]/g, '<\/pre>');
    content = content.replace(/\+\]/g, '<\/fieldset>');
    content = content.replace(/\<\]/g, '<\/dir>');
    content = content.replace(/\:\]/g, '<\/div>');

    content = content.replace(/([^-])---([^-])(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?/g, '$1<hr $6 class="$4">$2');

    content = content.replace(/\*\*(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)\*\*/g, '<b $4 class="$2">$5<\/b>');
    content = content.replace(/\/\/(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)\/\//g, '<i $4 class="$2">$5<\/i>');
    content = content.replace(/__(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)__/g, '<u $4 class="$2">$5<\/u>');
    content = content.replace(/--(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)--/g, '<strike $4 class="$2">$5<\/strike>');
    content = content.replace(/\%\%(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)\%\%/g, '<code $4 class="$2">$5<\/code>');
    content = content.replace(/\^\^(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)\^\^/g, '<sup $4 class="$2">$5<\/sup>');
    content = content.replace(/\,\,(([\w \t]*?)!)?(\s*\{\s*(.*?)\})?(.*?)\,\,/g, '<sub $4 class="$2">$5<\/sub>');

    content = content.replace(/\\\\/g, '<br>');

    //Wiki-Format: [@Index@] (interner Block)

    content = content.replace(/\01(.*?)\01/g, WikiSyntax.onBuildInclude);

    return content;
};

/**
 *  Rueckgabe der Wiki-Syntax zum angegebenen Kapitel.
 *  @param  chapter Kapitel
 *  @return die Wiki-Syntax zum angegebenen Kapitel
 */
WikiSyntax.getSource = function(chapter) {

    //TODO: Ermittlung der Position vom Kapiel und Rueckgabe vom Quelltext
    //  - Ermittlung der Kapitel beim Indezieren (nur Startposition)
    //  - Quelltext ist von Startposition Kapitel bis Startposition Folgekapitel oder Datenende
    //  - Sonderfall: Kapitel welche per Attachment eingebunden werden, diese sind dann nicht aenderbar
    
    return null;
};

/**
 *  Rueckgabe vom angeforderten Kapitel.
 *  Es wird immer das Kapitel der 1. Ordnung ermittelt.
 *  @param chapter Kapitel in beliebigem Format
 *  @param exact   true, wenn nur der Inhalt vom angeforderten Kapitel
 *                 zurueckgegeben werden soll
 */
WikiSyntax.getChapter = function(chapter, exact) {

    var content;
    var index;
    var offset;

    WikiSyntax.bind();
    
    //die Position im TOC wird ermittelt
    index = Toc.resolve(chapter);
    index = index.split(".");
    index = parseInt(index[0]);

    content = WikiSyntax.instance.builds[index -1];

    if (!content) {

        content = WikiSyntax.instance.chapters[index -1];
        content = WikiSyntax.buildChapter(content);

        WikiSyntax.instance.builds[index -1] = content;
    }

    if (exact) {

        index  = Toc.indexOf(index, true);
        offset = Toc.indexOf(chapter, true);

        if (offset >= 0) {

            offset  = ((offset -index) /4) +1;
            content = content.split("\n");
            content = content.length <= offset ? "" : content[offset];

        } else content = "";
    }

    //Wiki-Format: ~~~~ externer Zeilenumbruch
    //Wiki-Format: ~~ Trennzeichen

    //die internen Direktiven werden aufgeloest
    content = content.replace(/(~~~~\s*\02\s*)|(\02)/g, '\n');
    content = content.replace(/~~/g, '');

    return content;
};

/** Laedt und Transformiert den Inhalt. */
WikiSyntax.parse = function() {

    var content;
    var loop;
    var scripts;
    var control;
    var syntax;
    
    WikiSyntax.bind();

    //der Wiki-Content wird geladen
    content = Syntax.getContent();
    
    //alle Platzhalter werden eingesetzt
    content = content.replace(/\$\{(\w+)\}/g, WikiSyntax.onBuildData);
    
    //interne Steuerzeichen werden ggf. entfernt
    content = content.replace(/[\01\02\03\04\05\06\07]/g, ' ');

    //Zeilenumbrueche werden vereinfacht
    content = content.replace(/(\r\n)|(\n\r)|[\r\n]/g, '\02');

    //Wiki-Format: [!--Kommentar--]

    //Kommentare werden entfernt
    content = content.replace(/\[\!--.*?--\]/g, '');

    //Wiki-Format: [@Index@] (interner Block)

    //nicht ausfuehrbare Syntax wird ausgelagert
    content = content.replace(/\[@(.*?)@\]/g, WikiSyntax.onBuildExclude);
    
    //Wiki-Format: ==...Kapitel==...

    //alle Kapitel werden markiert und transformiert
    content = content.replace(/={2,7}\s*(@)?\s*(#{1,3})?(([^=]*?)!)?(\s*\{\s*(.*?)\})?(([^=]*?)\|)?([^=]*?)={2,7}/g, WikiSyntax.onBuildChapter);

    //alle (Unter)Kapitel werden geschlossen
    for (loop = 0; WikiSyntax.instance.index && loop < WikiSyntax.instance.index.length; loop++) {

        if (WikiSyntax.instance.index[loop -1] > 0) content += "<\/div><\/div>";
    }

    //Inhalt vor dem ersten Kapitel der Ebene 1 wird ignoriert
    content = content.replace(/^[^\07]/, '');

    //die Kapitel werden an der Ebene 1 aufgetrennt
    WikiSyntax.instance.chapters = content.split("\07");

    WikiSyntax.instance.chapters.shift();

    //der Cache der bereits aufbereiteten Kapitel wird eingerichtet
    WikiSyntax.instance.builds = new Array(WikiSyntax.instance.chapters.length);   
};

Application.registerEvent(window, "load", function() {WikiSyntax.initialize();});