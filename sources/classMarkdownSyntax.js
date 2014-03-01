/**
 *  Konstruktor, richtet das MarkdownSyntax-Objekt ein.
 *  Markdown stellt den Interpreter fuer die Markdown-Syntax bereit.
 *  Der Interpreter registriert sich selbststaendig ueber Syntax beim Parser,
 *  wenn der aktuelle Dialekt zum Interpreter passt.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classSyntax.js
 *      classToc.js  
 *      classMarkdown.js 
 *
 *  Ubersicht der Steuerzeichen:
 *    \01 Zeilenanfang [CR]
 *    \02 Zeilenende   [LF]
 *    \03 Markupmaskierung 
 *    \06 Zeichenmaskierung
 *    \07 Kapitelgrenze
 */
var MarkdownSyntax = function() {

    //Dialekt des Interpreters
    this.dialect = "markdown";
};

/** Ableitung vom WikiSyntax.*/
MarkdownSyntax.prototype = Interpreter;

/** Index im Toc (aktueller Stand) */
MarkdownSyntax.prototype.index;

/** Liste der Inhalte von Ausschluessen */
MarkdownSyntax.prototype.excludes;

/** Instanz vom Markdown Transformer */
MarkdownSyntax.prototype.marked;

/** Einsprung zur Befuellen der Platzhalter. */
MarkdownSyntax.onBuildData = Interpreter.onBuildData;

/** Rueckgabe der Liste mit den  fertig erstellen Kapiteln. */
MarkdownSyntax.getBuilds = Interpreter.getBuilds;

/** Rueckgabe der Liste mit erstellen Rohdaten der Kapitel. */
MarkdownSyntax.getChapters = Interpreter.getChapters;

/** Bindet die aktuelle Instanz ein. */
MarkdownSyntax.bind = Interpreter.bind;

/** Initialisiert den Interpreter und registriert ihn ggf. fuer die Markdown-Syntax. */
MarkdownSyntax.initialize = Interpreter.initialize;

/** Erstellt ein neues (Roh)Kapitels und registiert den TOC-Eintrag. */
MarkdownSyntax.createChapter = Interpreter.createChapter;

/**
 *  Einsprung zum Maskieren von Sonder- und Steuerzeichen.
 *  @param  match  Suchergebnis
 *  @return die maskierten Sonder- und Steuerzeichen
 */
MarkdownSyntax.onBuildEscapeCharacter = function(match) {

    var result;
    
    result = parseInt(match.charCodeAt(1)).toString(16);
    
    while (result.length < 2) result = "0" + result;
    
    return "\06" + result;
};

/**
 *  Erstellt die Extras als annonymes Objekt mit den Feldern id, styles und
 *  attributes als assoziatives Array.
 *  @param  extras zusaetzliche Attribute
 *  @return die ermittelten Extras als annonymes Objekt
 */
MarkdownSyntax.createExtras = function(extras) {

    var result; 
    
    result = new Object();

    if (!extras) return result;
    
    //interne Steuerzeichen werden ggf. entfernt
    extras = extras.replace(/[\01\02\03\04\05\06\07]/g, ' ');

    extras = extras.replace(/\\"/g, '01');
    extras = extras.replace(/\\'/g, '02');             
    
    //ggf. werden die Id's ermittelt
    extras.replace(/(?:^|\s)#(\w[^\s]+)/g, function(match, id) {

        result.id = id;
        
        return " ";
    });  
        
    //ggf. werden die Style-Klassen ermittelt        
    extras.replace(/(?:^|\s)\.(\w[^\s]+)/g, function(match, style) {
    
        if (!result.styles) result.styles = "";
        
        result.styles += " " + style;
        
        return " ";
    });
    
    //ggf. werden die Attribute ermittelt
    extras.replace(/(?:^|\s)(\w[^\s]+)\s*=\s*("[^"]*"|'[^']*'|[^\s]+)/g, function(match, attribute, value) {
    
        if (!result.attributes) result.attributes = new Object();
        
        //HINWEIS: Fehler in der entstehenden HTML-Syntax werden in Kauf
        //genommen, die Sorgfallt liegt beim Autor/Benutzer
        value = value.replace(/\01/g, '\\"');
        value = value.replace(/\02/g, '\\\'');
        
        if (attribute.match(/id/i)) {

            value = value.replace(/^['"]/, '');
            value = value.replace(/['"]$/, '');

            result.id = value;
        
        } else result.attributes[attribute] = value;

        return " ";
    });
    
    return result;
};

/**
 *  Erstellt aus den Extras einen Plane-String aus den enthaltenen Attributen.
 *  @param  extras zusaetzliche Attribute
 *  @return die Plane-String zu den ermittelten Attributen
 */
MarkdownSyntax.createExtrasAttributes = function(extras) {

    var result;
    var value;
    
    result = "";

    if (!extras || (typeof extras) == "string") extras = MarkdownSyntax.createExtras(extras);    
    
    if (extras && extras.attributes) {
    
        for (var key in extras.attributes) {
        
            value = extras.attributes[key] || "";
            
            if (!value.match(/^\s*(?:(".*")|('.*'))\s*$/)) value = value.match(/'/) ? "\"" + value + "\"" : "\'" + value + "\'";

            result += " " + key + "=" + value;
        }
    }
    
    return result; 
};

/**
 *  Einsprung zur Erstellung eines (Roh)Kapitels mit TOC-Eintrag.
 *  Dabei wird nur der Title und die HTML-Grundstruktur gebildet.
 *  @param  match  Suchergebnis
 *  @param  symbol Kennzeichnung
 *  @param  title  Titel
 *  @param  extras zusaetzliche Attribute (optional)
 *  @param  offset Fundstelle im durchsuchten Text
 *  @param  block  durchsuchter Text
 *  @return die HTML-Syntax zum Wiki-Element
 */
MarkdownSyntax.onBuildChapter = function(match, symbol, title, extras, offset, block) {

    var content; 
    var deep;
    var exclude;
    
    MarkdownSyntax.bind();
    
    //HINWEIS - Der Markdown-Parser und der Wiki-Interpeter passen von der
    //Arbeitsweise nicht zusammen, da Markdown zeilen- und der Wiki-Interpeter
    //musterbasiert funktionieren. Auch das Interpretieren von HTML-Inline
    //erfolgt unterschiedlich. Dadurch muss die Kapitelstrukt, welche vom
    //Markdown-Parser als HTML-Inline betrachtet wird, maskiert und ausgelagert
    //werden. Damit der Markdown-Parser seine Arbeit richtig macht, werden dazu
    //Platzhalter in Markdown-Syntax eingefuegt, welche spaeter wieder in das
    //HTML-Markup der Kapitel geaendert wird.

    extras  = MarkdownSyntax.createExtras(extras);
    content = MarkdownSyntax.createChapter(Math.min(symbol.length, 6), false, null, title, extras.id, extras.style, MarkdownSyntax.createExtrasAttributes(extras), "\07");
    deep    = content.match(/chapter chapter(\d+)/i)[1];
    
    for (exclude = ""; exclude.length < deep; exclude += "#") continue;

    if (!MarkdownSyntax.instance.excludes) MarkdownSyntax.instance.excludes = new Array();
    
    MarkdownSyntax.instance.excludes[MarkdownSyntax.instance.excludes.length] = content;

    content  = exclude.length < 2 ? "\07" : "";
    content += "\01" + exclude + "\03" + MarkdownSyntax.instance.excludes.length + "\02";

    return content
};

/**
 *  Formatiert den Inhalt des uebergebenen Kapitels.
 *  @param  content zu formatierender Inhalt
 *  @return der in HTML formatierte Inhalt
 */
MarkdownSyntax.buildChapter = function(content) {

    MarkdownSyntax.bind();
    
    if (!MarkdownSyntax.instance.marked) {
    
        MarkdownSyntax.instance.marked = marked;
        
        MarkdownSyntax.instance.marked.setOptions({renderer: new marked.Renderer(), gfm:true, tables:true, breaks:false, pedantic:false, sanitize:true, smartLists:true, smartypants:false});
    }

    //die internen Zeilenumbrueche werden wiederhergestellt
    content = content.replace(/(?:\02\01)|[\01\02]/g, '\n');
    content = MarkdownSyntax.instance.marked(content);
    
    //die interne Maskierung vom Kapitel-Markup wird ausgeloest
    content = content.replace(/<h\d+[^>]*>\03(\d+)<\/h\d+>/ig, function(match, index) {

        return MarkdownSyntax.instance.excludes[index -1];
    }); 
    
    //das abschliessende Markup der Kapitelstruktur wird hinzugefuegt
    content += MarkdownSyntax.instance.excludes[MarkdownSyntax.instance.excludes.length -1];
    
    //interne Steuerzeichen werden ggf. entfernt
    content = content.replace(/[\01\02\03\04\05\06\07]/g, ' ');

    return content;
};

/**
 *  Rueckgabe der Wiki-Syntax zum angegebenen Kapitel.
 *  @param  chapter Kapitel
 *  @return die Wiki-Syntax zum angegebenen Kapitel
 */
MarkdownSyntax.getSource = function(chapter) {

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
MarkdownSyntax.getChapter = function(chapter, exact) {

    var content;
    var index;
    var offset;

    MarkdownSyntax.bind();

    //die Position im TOC wird ermittelt
    index = Toc.resolve(chapter);
    index = index.split(".");
    index = parseInt(index[0]);

    content = MarkdownSyntax.instance.builds[index -1];
    
    if (!content) {

        content = MarkdownSyntax.instance.chapters[index -1];
        content = MarkdownSyntax.buildChapter(content);

        MarkdownSyntax.instance.builds[index -1] = content;
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
    
    //alle maskierten Zeichen werden demaskiert
    content = content.replace(/\06([0-9a-f]{2})/ig, function(match, code) {
    
        return String.fromCharCode(parseInt(code, 16)); 
    });

    return content;    
};

/** Laedt und Transformiert den Inhalt. */
MarkdownSyntax.parse = function() {

    var content;
    var loop;
    var scripts;
    var control;
    var syntax;
    
    MarkdownSyntax.bind();

    //der Wiki-Content wird geladen
    content = Syntax.getContent();
    
    //alle Platzhalter werden eingesetzt
    content = content.replace(/\$\{(\w+)\}/g, MarkdownSyntax.onBuildData);
    
    //Uebersicht der internen Steuerzeichen
    //  \02 Zeilenumbrueche
    //  \06 interne Maskierung von Zeichen \06(hex)
    //  \07 Kapitelanfang
    //  \05 Kapitelmarkup (wird darin eingeschlossen)
    
    //interne Steuerzeichen werden ggf. entfernt
    content = content.replace(/[\01\02\03\04\05\06\07]/g, ' ');
    
    //alle maskierten Zeichen werden intern maskiert
    content = content.replace(/\\[^\s\01\02]/g, MarkdownSyntax.onBuildEscapeCharacter);

    //Zeilenumbrueche werden vereinfacht
    content = "\01" + content.replace(/(\r\n)|(\n\r)|[\r\n]/g, '\02\01') + "\02";
    
    //Praeprozess fuer variierende Formate    
    
    //Wiki-Format: Kapitel \n ... \n ===...
    //Wiki-Format: Kapitel \n ... \n ---...
    content = content.replace(/(\01\s{0,3})([^=\01\02]+\01\02\s{0,3})={3,}/g, ' $1#$2');
    content = content.replace(/(\01\s{0,3})([^-\01\02]+\01\02\s{0,3})-{3,}/g, ' $1##$2');

    //Wiki-Format: <-- Kommentar -->

    //Kommentare werden entfernt
    content = content.replace(/\<\!--.*?--\>/g, '');    
        
    //alle Kapitel werden markiert und transformiert
    content = content.replace(/\01\s{0,3}(#{1,6})(.+?)(?:#{0,}\s*(?:\{(.*?)\})*\s*(?:\02|$))/g, MarkdownSyntax.onBuildChapter);      

    //alle (Unter)Kapitel werden geschlossen
    for (loop = 0, exclude = ""; MarkdownSyntax.instance.index && loop < MarkdownSyntax.instance.index.length; loop++) {

        if (MarkdownSyntax.instance.index[loop -1] > 0) exclude += "<\/div><\/div>";
    }
    
    if (!MarkdownSyntax.instance.excludes) MarkdownSyntax.instance.excludes = new Array();
    
    //das letzte Exclude enthaelt den Abschluss vom Markup der Kapitelstruktur
    MarkdownSyntax.instance.excludes[MarkdownSyntax.instance.excludes.length] = exclude;

    //Inhalt vor dem ersten Kapitel der Ebene 1 wird ignoriert
    content = content.replace(/^[^\07]/, '');    
    
    //die Kapitel werden an der Ebene 1 aufgetrennt
    MarkdownSyntax.instance.chapters = content.split("\07");      

    MarkdownSyntax.instance.chapters.shift();    

    //der Cache der bereits aufbereiteten Kapitel wird eingerichtet
    MarkdownSyntax.instance.builds = new Array(MarkdownSyntax.instance.chapters.length);
};

Application.registerEvent(window, "load", function() {MarkdownSyntax.initialize();});