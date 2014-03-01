/**
 *  Konstruktor, richtet das Attachments-Objekt ein.
 *  Attachments stellt eingebettete Dateiinhalte und Textmuster bereit.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 */
var Attachments = function() {
};

/** assoziatives Array zum Befuellen von Platzhaltern */
Attachments.data;

/** Laedt den Wiki-Inhalt der Seite. */
Attachments.load = function() {

    var content;
    var loop;
    var scripts;
    var data;

    scripts = document.getElementsByTagName("script");
    
    //die eingebetten Daten (Attachments) werden geladen
    for (loop = 0, content = ""; scripts && loop < scripts.length; loop++) {

        if (scripts[loop].getAttribute("type").match(/^\s*text\s*\/\s*data\s*$/i)) content += scripts[loop].innerHTML + " ";
    }

    data = new Object();

    //die eingebetten Daten (Attachments) werden geladen
    content.replace(/^.*$/gm, function(match) {

        match.replace(/^\s*([\.\-_a-z0-9]*)\s*([\+=])\s{0,1}(.*?)\s*$/i, function(match, key, mode, value) {
        
            resource = key || resource;
            
            if (!data[resource] || mode == "=") data[resource] = "";
            
            data[resource] += value;
        });
    });

    //interne Referenzen werden aufgeloest    
    for (var key in data) {

        data[key] = data[key].replace(/\$\{(\w+)\}/g, function(match, key) {

        return data[key] || match;});
    }
    
    Attachments.data = data;
};

/**
 *  Rueckgabe von true, wenn die Attachments komplett geladen sind.
 *  @return true, wenn die Attachments komplett geladen sind
 */
Attachments.completed = function() {

    return !!Attachments.data;
};

Application.registerEvent(window, "load", function() {Attachments.load();});