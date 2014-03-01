/**
 *  Konstruktor, richtet das Interpreter-Objekt ein.
 *  Abstrakte Klasse zur Implementierung von Interpretern zu einem Dialekt.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classAttachments.js
 *      classSyntax.js
 */
var Interpreter = function() {
};

Interpreter.prototype.dialect;

/** Liste der fertig erstellen Kapitel */
Interpreter.prototype.builds;

/** Liste der erstellen Rohdaten der Kapitel */
Interpreter.prototype.chapters;

/** Index im Toc (aktueller Stand) */
Interpreter.prototype.index;

/** Bindet die aktuelle Instanz ein. */
Interpreter.bind = function() {

    if (!this.instance) this.instance = new this();
};

/** Initialisiert den Interpreter und registriert ihn ggf. fuer den Parser. */
Interpreter.initialize = function() {

    var object = this;

    if (!Syntax || !Syntax.getDialect()) {window.setTimeout(function() {object.initialize(); }, 25); return;}
    
    this.bind();
    
    if (Syntax.getDialect() != this.instance.dialect || Syntax.getInterpreter()) return;
   
    Syntax.registerInterpreter(object);
};

/**
 *  Erstellt ein neues (Roh)Kapitels und registiert den TOC-Eintrag.
 *  Dabei wird nur der Title und die HTML-Grundstruktur gebildet.
 *  @param  level     Suchergebnis
 *  @param  limited   Option fuer Kapitel ohne Unterkapitel 
 *  @param  format    Format der Indexierung
 *  @param  title     Titel 
 *  @param  alias     Alias 
 *  @param  style     CSS-Klasse(n)
 *  @param  options   zusaetzliche Attribute
 *  @param  delimiter optionales Trennzeichnen zur Kennzeichnung von Kapiteln
 *  @return die erstellte HTML-Syntax
 */
Interpreter.createChapter = function(level, limited, format, title, alias, style, options, delimiter) {

    var loop;
    var number;
    var index;
    var result;

    this.bind();
    
    result = "";

    //ggf. werden Luecken durch annonyme Eintraege geschlossen    
    for (loop = 0; this.instance.index && loop < level -1 && loop < this.instance.index.length; loop++) {
    
        if (this.instance.index[loop] == 0)  result += this.createChapter(loop +1, false, format, null, null, null, null, delimiter);
    }
        
    index = level == 1 || Toc.size() > 0 ? Toc.addNode(level, title, alias, format) : new Array(0, 0, 0, 0, 0, 0);
        
    //alle vorranliegenden Unterkapitel werden geschlossen
    for (loop = level; this.instance.index && loop <= this.instance.index.length; loop++) {

        if (this.instance.index[loop -1] > 0) result += "<\/div><\/div>";
    }

    number = index.join(".").replace(/(\.0|[\.-])+$/, '');

    if (format && format.length > 0) title = Toc.buildNumeration(index, format) + " " + (title || "");

    if (level == 1 && delimiter) result += delimiter;

    result += "\n";
    result += "<div class=\"chapter chapter" + level + " " + (style || "") + "\" id=\"Chapter" + number + "\" name=\"" + (alias || "") + "\">";

    if (title) result += "<h" + level + " " + (options || "") + " class=\"" + (style || "") + "\">" + title + "<span onclick=\"EditorView.show('" + number + "');\"></span><\/h" + level + ">";

    result += "<div class=\"content content" + level + "\" id=\"Content" + number + "\">";
    
    if (limited) {index[level -1] = -Math.abs(index[level -1]); result += "<\/div><\/div>";}

    this.instance.index = index.slice(0);
    
    return result; 
};

/**
 *  Einsprung zur Befuellen der Platzhalter.
 *  @param  match Suchergebnis
 *  @param  data  Name vom Platzhalter
 *  @return der ermittelte Wert zum Platzhalter
 */
Interpreter.onBuildData = function(match, data) {

    return Attachments.data[data] || match;
};

/**
 *  Rueckgabe der Liste mit den  fertig erstellen Kapiteln.
 *  @return Liste mit den  fertig erstellen Kapiteln
 */
Interpreter.getBuilds = function() {

    this.bind();
    
    return this.instance.builds;
};

/**
 *  Rueckgabe der Liste mit erstellen Rohdaten der Kapitel.
 *  @return Liste mit erstellen Rohdaten der Kapitel
 */
Interpreter.getChapters = function() {

    this.bind();
    
    return this.instance.chapters;
};