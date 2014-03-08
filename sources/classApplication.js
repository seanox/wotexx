/**
 *  Konstruktor, richtet das Application-Objekt ein.
 *  Application stellt Methoden fuer den allgemeinen Umgang mit der Anwenung
 *  bereit.
 *
 *  Erforderliche Abhaengigkeiten:
 *
 *      classResources.js
 */
var Application = function() {
};

/** Status der Fehleranzeige */
Application.error;

/** Kommandozeilenparameter (nur HTA) */
Application.commandLine = hta ? hta.commandLine : null;

/**
 *  Rueckgabe true, wenn es sich um eine HTA-Anwendung handelt.
 *  @return true, wenn es sich um eine HTA-Anwendung handelt
 */
Application.isHta = function() {

    return !!Application.commandLine;
};

/**
 *  Rueckgabe true, wenn die Ausfuehrung unter Windows erfolgt.
 *  @return true, wenn die Ausfuehrung unter Windows erfolgt
 */
Application.useWindows = function() {

    try {return (navigator.platform.search(/^win/i) >= 0);
    } catch (exception) {return false;}
};

/**
 *  Einsprung beim Auftreten eines Fehlers.
 *  Die Fehlermeldung wird ca. 3 Sekunden eingeblendet.
 *  @param message   Meldung
 *  @param location  Location
 *  @param line      Zeile
 */
Application.onError = function(message, location, line) {

    if (Application.error) return;
    
    Application.error = true;

    message = message ? String(message).replace(/^\s+|\s+$/g, '') : "";
    message = message.length <= 0 ? Resources.TextUnknown : message;

    location = location ? String(location).replace(/^\s+|\s+$/g, '') : "";
    location = location.length > 0 ? "\n\t" + location : "";

    line = line ? String(line).replace(/^\s+|\s+$/g, '') : "";
    line = line.length > 0 ? " (" + line + ")" : line;  
        
    message = (message + location + line).replace(/^\s+|\s+$/g, '');
    message = Resources.resolve("ApplicationOnErrorMessage", [message]);

    try {MessageDialog.show(document.title, message, MessageDialog.OPTION_CRITICAL, function() {window.location.reload();});
    } catch (exception) {

        alert(message.replace(/\t/g, ''));

        window.location.reload();
    }

    return true;
};

/**
 *  Registriert ein Ereignis beim angegebenen Objekt.
 *  @param object  Bezugsobjekt
 *  @param event   Ereignis als Text
 *  @param call    Funktionsaufruf
 *  @param capture Informationsfluss (capturing, bubbling)
 */
Application.registerEvent = function(object, event, call, capture) {

    var script;
    
    if (typeof object === "string") object = document.querySelector(object);
    
    script = " var swap;\n"
           + " if (object.addEventListener) object.addEventListener(\"${event}\", call, capture);\n"
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
 *  Erstellt eine neue, auf Millisekunden basierende, Id. Zur Verkuerzung der
 *  Laenge, werden die Millisekunden seit dem 01.01.2000 verwendet.
 *  @return die erstelle Id
 */
Application.getSerial = function() {

    var result;

    result = new Date().getTime();

    while (new Date().getTime() == result) continue;

    return result -946681200000;
};

/**
 *  Rueckgabe der Startparameter als assoziatives Array.
 *  Mit der Option plain werden alle Parameter als einfaches Array ermittelt.
 *  @param  plain optional true, zur Rueckgabe der parameter
 *  @return die Startparameter als Array
 */
Application.getStartParameter = function(plain) {

    var options;
    var loop;
    var result;
    var matches;
    var shadow;

    options = window.location.search;
    options = options.length > 0 ? options.substr(1) : options;
    options = options.split("&");

    result = plain ? new Array() : new Object();
    
    for (loop = 0; loop < options.length; loop++) {
    
        matches = options[loop].match(/^(.*?)(?:=(.*))?$/);
        
        if (matches && plain) {
        
            if (matches.length > 0) result[result.length] = matches[1];
            if (matches.length > 1) result[result.length] = matches[2];

            continue;
        }
        
        if (!matches || matches.length < 2) continue;
        
        result[matches[1]] = decodeURI(matches[2]);
    }

    //alternativ werden die Kommandozeilen-Parameter bei HTA uebernommen
    if (Application.isHta()) {

        options = Application.commandLine.match(/(?:-[^\s]*)|(?:[^\s]+)|(?:\"[^\"]*\")|(?:\'[^\']*\')/g);
        
        for (loop = 1, shadow = null; loop < options.length; loop++) {
        
            if (plain) {result[result.length] = options[loop]; continue;}

            matches = options[loop].match(/^-+(.+)/);
            
            if (matches && matches.length > 1) {
                          
                shadow = matches[1];
                
                result[shadow] = "";
                
                continue;
                
            } else if (!shadow) continue;
            
            result[shadow] = options[loop];
            
            shadow = null;
        }
    }
    
    return result;
};

/**
 *  Einer Meta-Angabe aus dem Header (meta http-equiv).
 *  @return der Wert der Meta-Angabe, sonst null
 */
Application.getMetaParameter = function(name) {

    var data;
    
    data = document.querySelector("meta[http-equiv='" + name + "']");
    
    return data ? data.getAttribute("content") : null;
};

/**
 *  Rueckgabe von true, wenn die Application komplett geladen ist.
 *  @return true, wenn die Application komplett geladen ist
 */
Application.completed = function() {

    return Resources.completed();
};

window.onerror = Application.onError;

Application.registerEvent(window, "load", function() {window.onerror = Application.onError;});