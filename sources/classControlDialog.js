/**
 *  Konstruktor, richtet das ControlDialog-Objekt ein.
 *  ControlDialog zeigt die Werkzeugleiste beim Druecken der Alt-Taste.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classDialog.js
 */
 var ControlDialog = function() {

    //Name der GUI-Component in der HTML-Struktur
    this.context = "ControlDialog";
};

/** Ableitung vom Dialog.*/
ControlDialog.prototype = Dialog;

/** Bindet die GUI-Komponente ein. */
ControlDialog.bind = Dialog.bind;

/** Rueckgabe true, wenn der Dialog atuell dargestellt wird. */
ControlDialog.isVisible = Dialog.isVisible;

/** Blendet die GUI-Komponente ein. */
ControlDialog.show = Dialog.show;

/** Blendet die GUI-Komponente aus. */
ControlDialog.hide = Dialog.hide;

/** aktuelle ermittelter  Status */
ControlDialog.control;

/** letzter angewandter Status */
ControlDialog.shadow;

/** Zeitpunkt der letzten Statusaenderung */
ControlDialog.timing;

/** Konstante fuer den Context ControlDialog */
ControlDialog.CONTEXT = "ControlDialog";

/** Konstante fuer die Schaltflaeche Home */
ControlDialog.BUTTON_HOME = "ControlDialogHome";

/** Konstante fuer die Schaltflaeche Home */
ControlDialog.BUTTON_EDIT = "ControlDialogEdit";

/** Konstante fuer die Schaltflaeche Print */
ControlDialog.BUTTON_PRINT = "ControlDialogPrint";

/** Konstante fuer die Schaltflaeche Search */
ControlDialog.BUTTON_SEARCH = "ControlDialogSearch";

/** Konstante fuer das Kapitel Suche */
ControlDialog.CHPATER_SEARCH = "Suchen";

/** Initialisiert die ControlDialog. */
ControlDialog.initialize = function() {

    Application.registerEvent(document, "keydown", ControlDialog.onControl);
    Application.registerEvent(document, "keypress", ControlDialog.onControl);
    Application.registerEvent(document, "keyup", ControlDialog.onControl);
    Application.registerEvent(window, "load", ControlDialog.watchEditMode);    
};

/**
 *  Rueckgabe true, wenn alle erforderlichen HTML-Elemente enthalten sind.
 *  @return true, wenn alle erforderlichen HTML-Elemente enthalten sind
 */
ControlDialog.isValid = function() {

    ControlDialog.bind();

    try {

        if (ControlDialog.instance.object
            && document.getElementById(ControlDialog.BUTTON_HOME)
            && document.getElementById(ControlDialog.BUTTON_EDIT)
            && document.getElementById(ControlDialog.BUTTON_PRINT)
            && document.getElementById(ControlDialog.BUTTON_SEARCH)) return true;

    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    return false;
};

/** Individuelle Anpassung/Konfiguration vom ControlDialog. */
ControlDialog.customize = function() {

    document.getElementById(ControlDialog.BUTTON_HOME).disabled = true;
    document.getElementById(ControlDialog.BUTTON_EDIT).disabled = true;
    document.getElementById(ControlDialog.BUTTON_PRINT).disabled = true;
    document.getElementById(ControlDialog.BUTTON_SEARCH).disabled = true;
};

/** Bindet die GUI-Komponente ein. */
ControlDialog.show = function() {

    var access;
    
    if (Parser && Parser.getChapterSize() > 0)
        document.getElementById(ControlDialog.BUTTON_HOME).disabled = false;

    if (Parser && Parser.getChapterSize() > 0)
        document.getElementById(ControlDialog.BUTTON_PRINT).disabled = false;

    if (Parser.getChapter(ControlDialog.CHPATER_SEARCH, true))
        document.getElementById(ControlDialog.BUTTON_SEARCH).disabled = false;
        
    access = Application.getMetaParameter("content-mode").replace(/\s+/g, '') || "";
    access = ("|" + access + "|").match(/\|write\|/);
    
    if (Application.isHta() && access && String(window.location).match(/^file:\/\//i))
        document.getElementById(ControlDialog.BUTTON_EDIT).disabled = false;

    Dialog.show(this);
};

/** Einsprung beim Klick auf Home. */
ControlDialog.onClickHome = function() {

    ContentView.show("1");
};

/** Einsprung beim Klick auf Edit. */
ControlDialog.onClickEdit = function() {

    var shell;
    var source;

    shell  = new ActiveXObject("Wscript.Shell");
    source = decodeURI(String(window.location)).replace(/^file:\/+/, '').replace(/\//g, '\\');
    
    shell.Run("notepad.exe \"" + source + "\"", 3);
};

/** Einsprung beim Klick auf Print. */
ControlDialog.onClickPrint = function() {

    window.print();
};

/** Einsprung beim Klick auf Search. */
ControlDialog.onClickSearch = function() {

    ContentView.show(ControlDialog.CHPATER_SEARCH);
};

/**
 *  Einsprung bei Tastatureingaben.
 *  @param event Ereignis
 */
ControlDialog.onControl = function(event) {

    event = event || window.event;

    ControlDialog.control = event.altKey && !event.type.match(/keyup/i);
    
    if (ControlDialog.control) ControlDialog.timing = new Date().getTime();
};

/** Ueberwacht den Tastaturstatus zur Anzeige der Toolbox. */
ControlDialog.watchEditMode = function() {

    var rule; 
    var loop;    

    if (new Date().getTime() -ControlDialog.timing > 250 && ControlDialog.control) ControlDialog.control = false;

    if (ControlDialog.shadow != ControlDialog.control) {
    
        ControlDialog.shadow = ControlDialog.control;

        if (!ControlDialog.isVisible() && ControlDialog.control) ControlDialog.show();
        else if (ControlDialog.isVisible()) ControlDialog.hide();
    }
    
    window.setTimeout(ControlDialog.watchEditMode, 25);
};

ControlDialog.initialize();