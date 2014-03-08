/**
 *  Konstruktor, richtet das Syntax-Objekt ein.
 *  Syntax, erkennt den aktuell verwendeten Dialekt und gibt den Interpretern
 *  die Moeglichkeit sich  sich fuer die Verarbeltung zu registrieren, damit der
 *   Parser diese dann zur Transformation heranziehen kann.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 */
var Syntax = function() {
};

/** aktueller Dialekt */
Syntax.prototype.dialect;

/** aktueller Interpreter */
Syntax.prototype.interpreter;

/** Instanz von Syntax fuer statische Objektzugriffe */
Syntax.instance;

/** Liste der benutzerdefinierten Filter (Ausdruecke) */
Syntax.customPattern;

/** Bindet die aktuelle Instanz ein. */
Syntax.bind = function() {

    if (!Syntax.instance) Syntax.instance = new this();
};

/** 
 *  Initialisiert die Syntax.
 *  Die verfuegbaren Dialekte werden mit dem Meta-Tag http-equiv:content-syntax
 *  gesetzt. Der erste Skript-Block mit gleichem Typ wird dann als aktueller
 *  Dialekt verwendet.
 */
Syntax.initialize = function(syntax) {

    var dialect;
    var pattern;
    var scripts;
    var loop;
    var matches;
    
    Syntax.bind();
    
    dialect = Application.getMetaParameter("content-dialect").replace(/\s+/g, '') || "";
    pattern = new RegExp("^\\s*text\\s*\\/\\s*(" + dialect + ")\\s*$", "i");
    
    scripts = document.getElementsByTagName("script");
    
    //der Content wird ermittelt
    for (loop = 0; !Syntax.instance.dialect && scripts && loop < scripts.length; loop++) {
    
        matches = scripts[loop].getAttribute("type").match(pattern);
        
        if (matches) Syntax.instance.dialect = matches[1].toLowerCase();
    }
    
    if (!Syntax.instance.dialect) Syntax.instance.dialect = "wiki";
};

/**
 *  Registriert einen Interpreter fuer den aktuellen Dialekt, wenn noch keiner
 *  registriert wurde. Das Registrieren uebernehmen die Interpreter in
 *  Eigenregie, wenn sie einen fuer sich interpretierbaren Dialekt finden.
 *  Ueber diesen Weg, kann die Auswertung und Suche nach einem Interpreter
 *  nebenlaeufig erfolgen.
 */
Syntax.registerInterpreter = function(interpreter) {

    Syntax.bind();

    if (!Syntax.instance.interpreter) Syntax.instance.interpreter = interpreter;
};

/**
 *  Rueckgabe vom aktuellen Dialekt, sonst null.
 *  @return der aktuelle Dialekt, sonst null
 */
Syntax.getDialect = function() {

    Syntax.bind();

    return Syntax.instance.dialect;
};

/**
 *  Rueckgabe vom aktuellen Interpreter, sonst null.
 *  @return der aktuelle Interpreter, sonst null
 */
Syntax.getInterpreter = function() {

    Syntax.bind();

    return Syntax.instance.interpreter;
};

/** Delegiert das das LAden und Transformiert vom Inhalt. */
Syntax.parse = function() {

    Syntax.bind();
    
    if (!Syntax.instance.interpreter) return;
    
    Syntax.instance.interpreter.parse();
};

/**
 *  Rueckgabe vom Content zum aktuellen Dialekt.
 *  Ohne Dialekt wird null zurueckgegeben.
 *  @return der Content zum aktuellen Dialekt, ohne Dialekt null
 */
Syntax.getContent = function() {

    var scripts;
    var loop;
    var content;
    var pattern;
    
    Syntax.bind();
    
    if (!Syntax.instance.dialect) return null;

    scripts = document.getElementsByTagName("script");
    pattern = new RegExp("^\\s*text\\s*\\/\\s*(" + Syntax.instance.dialect + ")\\s*$", "i");
    
    //der Wiki-Content wird geladen
    for (loop = 0, content = "", control = false; scripts && loop < scripts.length; loop++) {

        if (scripts[loop].getAttribute("type").match(pattern)) content += scripts[loop].innerHTML + " ";
    }    

    return content;
};

/**
 *  Ermittelt benutzerdefinierte Filter (Ausdruecke) und wendet diese an.
 *  @param  content zu ersetzender Inhalt
 *  @return der ersetzte Inhalt
 */
Syntax.customContent = function(content) {

    var loop;
    var scripts;
    var data;
    var filter;
    var pattern;
    
    if (!Syntax.customPattern) {
    
        Syntax.customPattern = new Array();

        scripts = document.getElementsByTagName("script");
        
        //die eingebetten Filter werden geladen
        for (loop = 0, data = ""; scripts && loop < scripts.length; loop++) {

            if (scripts[loop].getAttribute("type").match(/^\s*text\s*\/\s*filter\s*$/i)) data += scripts[loop].innerHTML + " ";
        }
        
        //die Filter werder zeilenweise ermittelt
        data = data.replace(/(\r\n)|(\n\r)|[\r\n]/g, '\n');
        data = data.split("\n");
        
        for (loop = 0; loop < data.length; loop++) {
        
            //Ausdruck und Muster werden ermittelt
            filter = data[loop].match(/\s*(.*?)\s*\-\>\s*(.*)\s*/);
            
            if (!filter || filter.length < 3) continue;
            
            pattern = filter[1].match(/\/(.*)\/(.*)/);
            
            if (!pattern || pattern.length < 3) continue;

            //Ausdruck und Muster werden registriert
            try {Syntax.customPattern[Syntax.customPattern.length] = [new RegExp(pattern[1], pattern[2]), filter[2]];
            } catch (exception) {
            
                continue;
            }
        }
    }
    
    for (loop = 0; loop < Syntax.customPattern.length; loop++) {
    
        //Ausdruck und Muster werden angewandt
        try {content = content.replace(Syntax.customPattern[loop][0], Syntax.customPattern[loop][1]);
        } catch (exception) {
        
            continue;
        }
    }
    
    return content;
}; 

/**
 *  Rueckgabe von true, wenn die Syntax komplett geladen ist.
 *  @return true, wenn die Syntax komplett geladen ist
 */
Syntax.completed = function() {

    return !!Syntax.getDialect() && !!Syntax.getInterpreter();
};

Application.registerEvent(window, "load", function() {Syntax.initialize();});