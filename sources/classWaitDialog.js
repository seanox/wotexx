/**
 *  Konstruktor, richtet das WaitDialog-Objekt ein.
 *  Der Dialog stellt ein Warte-Symbol dar und sperrt die Browseransicht.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classDialog.js
 */
 var WaitDialog = function() {

    //Name der GUI-Component in der HTML-Struktur
    this.context = "WaitDialog";

    //Option zum Sperren der GUI-Component
    this.lock = true;
};

/** Ableitung vom Dialog.*/
WaitDialog.prototype = Dialog;

/** Bindet die GUI-Komponente ein. */
WaitDialog.bind = Dialog.bind;

/** Blendet die GUI-Komponente ein. */
WaitDialog.show = Dialog.show;

/** Blendet die GUI-Komponente aus. */
WaitDialog.hide = Dialog.hide;

/** Konstante fuer den Context WaitDialog */
WaitDialog.CONTEXT = "WaitDialog";

/** Individuelle Anpassung/Konfiguration vom WaitDialog. */
WaitDialog.customize = function() {

    WaitDialog.bind();
    
    Dom.addCssClass(WaitDialog.instance.object, ["screen", "only"]);
};