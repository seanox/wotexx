/**
 *  Konstruktor, richtet das Resource-Objekt ein.
 *  Resources stellt eine Label-Value-Map und einen Praeprozessor fuer
 *  mehrsprachige Ausgabe bereit, welcher Platzhalter im Format $<label> direkt
 *  in der HTML-Struktur unterstuetzt.
 *  Das Ersetzen erfolgt automatisch mit Laden der Seite.
 *  Resources werden als Skript-Block vom Typ "text/resources" angelegt.
 *  Das Attribut "lang" definiert die entsprechende Sprache. Ist zur
 *  Spracheinstellung des Browsers keine passende Resource vorhanden, wird das
 *  erste Resource-Skript als Standard verwendet.
 *  Resourcen werden per Label|Value zugewiesen, wozu verschiedene Symbole bei
 *  der Zuweisung unterstuetzt werden:
 *    =  setzt den Wert zum Schlüssel
 *    +  erweitert einen bestehenden Wert eines Schluessel
 */
var Resources = function () {
};

/** assoziatives Array mit Labels und Values */
Resources.map;

/** Konstante fuer den Verarbeitungsstatus unbekannt */
Resources.STATUS_UNKNOW = 0;

/** Konstante fuer den Verarbeitungsstatus beim Laden */
Resources.STATUS_LOAD = 1;

/** Konstante fuer den Verarbeitungsstatus beim Vorbereiten */
Resources.STATUS_PREPARE = 2;

/** Konstante fuer den Verarbeitungsstatus fertig */
Resources.STATUS_COMPLETE = Resources.STATUS_LOAD | Resources.STATUS_PREPARE;

/** aktueller Verarbeitungsstatus */
Resources.status = Resources.STATUS_UNKNOW;

/**
 *  Registriert ein Ereignis beim angegebenen Objekt.
 *  @param object Bezugsobjekt
 *  @param event  Ereignis als Text
 *  @param call   Funktionsaufruf
 */
Resources.registerEvent = function(object, event, call) {

    var script;    

    script = " var swap;\n"
           + " if (object.addEventListener) object.addEventListener(\"${event}\", call, false);\n"
           + " else if (object.attachEvent) object.attachEvent(\"on${event}\", call);\n"
           + " else {\n"
           + "   swap = object.on${event};\n"
           + "   object.on${event} = function() {\n"
           + "     if (swap) swap();\n"
           + "     call();\n"
           + "   };\n"
           + " }\n";

    script = script.replace(new RegExp("\\$\\{event\\}", "g"), event);

    try {eval(script);
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }
};

/** 
 *  Laed die Ressourcen zur Spracheinstellung des Browsers.
 *  Resources werden als Skript-Block vom Typ "text/resources" angelegt.
 *  Das Attribute "lang" definiert die Sprache. Ist zur Spracheinstellung des
 *  Browsers keine passende Resource vorganden, wird das erste Resource-Skript
 *  als Standard verwendet.
 */
Resources.load = function() {

    var language;
    var scripts;
    var loop;
    var content;
    var resource;

    language = (navigator.language || navigator.userLanguage).toLowerCase();
    scripts  = document.getElementsByTagName("script");
    
    for (loop = 0, content = null; scripts && loop < scripts.length; loop++) {

        if (!scripts[loop].getAttribute("type").match(/^\s*text\s*\/\s*resources\s*$/i)) continue;
        if (content === null) content = scripts[loop].innerHTML;
        if (scripts[loop].getAttribute("lang").toLowerCase() != language) continue;
        
        content = scripts[loop].innerHTML;

        break;
    }
    
    Resources.map = new Object();

    content.replace(/^.*$/gm, function(match) {

        match.replace(/^\s*([\.\-_a-z0-9]*)\s*([\+=])\s{0,1}(.*?)\s*$/i, function(match, key, mode, value) {
        
            resource = key || resource;
            
            if (!Resources.map[resource] || mode == "=") Resources.map[resource] = "";
            
            Resources.map[resource] += value;
        });
    });

    //interne Referenzen werden aufgeloest    
    for (var key in Resources.map) {

        Resources.map[key] = Resources.map[key].replace(/\$\{(\w+)\}/g, function(match, key) {return Resources.map[key] || match;});
    }

    Resources.status |= Resources.STATUS_LOAD;
};

/**
 *  Loest die Platzhalter im angegebenen Label mit den Werten der uebgebenen
 *  Werteliste auf. Liegen in einem Label mehr Platzhalter als Werte vor, werden
 *  die ueberschuessigen Platzhalter entfernt.
 *  @param  label  Label
 *  @param  values Werte
 *  @return das angegebene Label mit aufgeloesten Platzhaltern
 */
Resources.resolve = function(label, values) {

    label = Resources.map[label] || "";
    label = label.replace(/\\.+/ig, function(match) {return eval("\"" + match + "\"");});
    label = label.replace(/\$\{(\d+)\}/g, function(match, index) {return values && index < values.length ? values[index] : "";});

    return label;
};

/** Ersetzt alle Resources-Platzhalter im Dokument(Body). */
Resources.prepareDocument = function() {

    if ((Resources.status & Resources.STATUS_LOAD) == 0) {window.setTimeout(Resources.prepareDocument, 25); return;}

    document.body.innerHTML = document.body.innerHTML.replace(/\$(\w+)\b/g, function(match, key) {return Resources.map[key] ||  match;});
    
    Resources.status |= Resources.STATUS_PREPARE;
};

/**
 *  Rueckgabe von true, wenn Resources komplett geladen ist.
 *  @return true, wenn Resources komplett geladen ist
 */
Resources.completed = function() {

    return Resources.status == Resources.STATUS_COMPLETE;
};

Resources.load();

Resources.registerEvent(window, "load", function() {Resources.prepareDocument();});