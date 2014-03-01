/**
 *  Konstruktor, richtet das EditorView-Objekt ein.
 *  EditorView stellt den Einsprung zur Bearbeitung im externe dot.NET-Editor
 *  bereit.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classDom.js 
 */
var EditorView = function() {
};

/** Liste der Styles */
EditorView.styles;

/** aktuelle ermittelter  Status */
EditorView.control;

/** letzter angewandter Status */
EditorView.shadow;

/** Zeitpunkt der letzten Statusaenderung */
EditorView.timing;

/** Initialisiert die EditorView. */
EditorView.initialize = function() {

    //TODO: if (!window.external) return;

    Application.registerEvent(document, "keydown", EditorView.onControl);
    Application.registerEvent(document, "keypress", EditorView.onControl);
    Application.registerEvent(document, "keyup", EditorView.onControl);
    Application.registerEvent(window, "load", EditorView.watchEditMode);    
};

/**
 *  Rueckgabe true, wenn der Ediot verfuegbar ist, sonst false.
 *  @return true, wenn der Ediot verfuegbar ist, sonst false.
 */
EditorView.isAvailable = function() {

    return !!window.external;
};

/**
 *  Oeffnet das angegebene Kapitel zur Bearbeitung oder ein neues Kapitel zur
 *  Erstellung. Die Funktion ist nur im Context vom dot.NET-Editor verfuegbar.
 *  @param chapter Kapitel
 */
EditorView.open = function(chapter) {

    if (!window.external || !window.external.EditChapter) return;
    
    window.external.EditChapter(chapter);
};

/**
 *  Einsprung bei Tastatureingaben.
 *  @param event Ereignis
 */
EditorView.onControl = function(event) {

    event = event || window.event;
    
    EditorView.control = event.altKey && !event.type.match(/keyup/i);
    
    if (EditorView.control) EditorView.timing = new Date().getTime();
};

/**
 *  Ueberwacht den Tastaturstatus zur Bearbeitung und steuert die Anzeige vom
 *  Bearbeitungssymbol.
 */
EditorView.watchEditMode = function() {

    var rule; 
    var loop;    

    if (new Date().getTime() -EditorView.timing > 250 && EditorView.control) EditorView.control = false;

    if (EditorView.shadow != EditorView.control) {
    
        EditorView.shadow = EditorView.control;
        
        if (!EditorView.styles) {

            EditorView.styles =  new Array();
        
            for (loop = 0; loop < 5; loop++) {

                rule = Dom.getCssRule("#ContentView h" + (loop +1) + " > span");

                if (rule) EditorView.styles[loop] = rule.style;
            }
        }
    
        for (loop = 0; EditorView.styles && EditorView.styles.length && loop < EditorView.styles.length; loop++) {

            EditorView.styles[loop].visibility = EditorView.control ? "visible" : "hidden";
        }
    }
    
    window.setTimeout(EditorView.watchEditMode, 25);
};

EditorView.initialize();