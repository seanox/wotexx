/**
 *  Konstruktor, richtet das MessageDialog-Objekt ein.
 *  Der Dialog stellt allgemeine Nachrichten dar.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classDialog.js 
 */
var MessageDialog = function() {

    //Name des GUI-Component in der HTML-Struktur
    this.context = "MessageDialog";

    //Option zum Sperren des GUI-Component
    this.lock = false;

    //CallBack zur Datenrueckgabe
    this.call = null;
};

/** Ableitung vom Dialog.*/
MessageDialog.prototype = Dialog;

/** Bindet die GUI-Komponente ein. */
MessageDialog.bind = Dialog.bind;

/** Blendet die GUI-Komponente aus. */
MessageDialog.hide = Dialog.hide;

/** Konstante fuer den Context MessageDialog */
MessageDialog.CONTEXT = "MessageDialog";

/** Konstante fuer den Context MessageDialogTitle */
MessageDialog.DIALOG_TITLE = MessageDialog.CONTEXT + "Title";

/** Konstante fuer den Context MessageDialogSymbol */
MessageDialog.DIALOG_SYMBOL = MessageDialog.CONTEXT + "Symbol";

/** Konstante fuer den Context MessageDialogContent */
MessageDialog.DIALOG_CONTENT = MessageDialog.CONTEXT + "Content";

/** Konstante fuer das MessageDialog-Symbol Critical */
MessageDialog.SYMBOL_CRITICAL = "critical";

/** Konstante fuer das MessageDialog-Symbol Question */
MessageDialog.SYMBOL_QUESTION = "question";

/** Konstante fuer das MessageDialog-Symbol Exclamation */
MessageDialog.SYMBOL_EXCLAMATION = "exclamation";

/** Konstante fuer das MessageDialog-Symbol Information */
MessageDialog.SYMBOL_INFORMATION = "information";

/** Konstante fuer die Schaltflaeche Ok */
MessageDialog.BUTTON_OK = "MessageDialogOk";

/** Konstante fuer die Schaltflaeche Yes */
MessageDialog.BUTTON_YES = "MessageDialogYes";

/** Konstante fuer die Schaltflaeche No */
MessageDialog.BUTTON_NO = "MessageDialogNo";

/** Konstante fuer die Schaltflaeche Retry */
MessageDialog.BUTTON_RETRY = "MessageDialogRetry";

/** Konstante fuer die Schaltflaeche Ignore */
MessageDialog.BUTTON_IGNORE = "MessageDialogIgnore";

/** Konstante fuer die Schaltflaeche Cancel */
MessageDialog.BUTTON_CANCEL = "MessageDialogCancel";

/** Konstante fuer die Schaltflaeche ohne Button */
MessageDialog.BUTTON_NONE = "MessageDialogNone";

/** Konstante fuer die Option Ok */
MessageDialog.OPTION_OK = 1;

/** Konstante fuer die Option Cancle */
MessageDialog.OPTION_CANCEL = 2;

/** Konstante fuer die Option Retry */
MessageDialog.OPTION_RETRY = 4;

/** Konstante fuer die Option Ignore */
MessageDialog.OPTION_IGNORE = 8;

/** Konstante fuer die Option Yes */
MessageDialog.OPTION_YES = 16;

/** Konstante fuer die Option No */
MessageDialog.OPTION_NO = 32;

/** Konstante fuer die Option ohne Button */
MessageDialog.OPTION_NONE = 65536;

/** Konstante fuer die Option Critical */
MessageDialog.OPTION_CRITICAL = 64;

/** Konstante fuer die Option Question */
MessageDialog.OPTION_QUESTION = 128;

/** Konstante fuer die Option Exclamation */
MessageDialog.OPTION_EXCLAMATION = 256;

/** Konstante fuer die Option Information */
MessageDialog.OPTION_INFORMATION = 512;

/** Konstante fuer den Fokus Ok */
MessageDialog.FOCUS_OK = 1024;

/** Konstante fuer den Fokus Cancle */
MessageDialog.FOCUS_CANCEL = 2048;

/** Konstante fuer den Fokus Retry */
MessageDialog.FOCUS_RETRY = 4096;

/** Konstante fuer den Fokus Ignore */
MessageDialog.FOCUS_IGNORE = 8192;

/** Konstante fuer den Fokus Yes */
MessageDialog.FOCUS_YES = 16384;

/** Konstante fuer den Fokus No */
MessageDialog.FOCUS_NO = 32768;

/**
 *  Rueckgabe true, wenn alle erforderlichen HTML-Elemente enthalten sind.
 *  @return true, wenn alle erforderlichen HTML-Elemente enthalten sind
 */
MessageDialog.isValid = function() {

    MessageDialog.bind();

    try {

        if (MessageDialog.instance.object
            && document.getElementById(MessageDialog.CONTEXT)
            && document.getElementById(MessageDialog.DIALOG_TITLE)
            && document.getElementById(MessageDialog.DIALOG_CONTENT)
            && document.getElementById(MessageDialog.DIALOG_SYMBOL)
            && document.getElementById(MessageDialog.BUTTON_OK)
            && document.getElementById(MessageDialog.BUTTON_YES)
            && document.getElementById(MessageDialog.BUTTON_NO)
            && document.getElementById(MessageDialog.BUTTON_RETRY)
            && document.getElementById(MessageDialog.BUTTON_IGNORE)
            && document.getElementById(MessageDialog.BUTTON_CANCEL)) return true;

    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    return false;
};

/** Individuelle Anpassung/Konfiguration vom MessageDialog. */
MessageDialog.customize = function() {

    MessageDialog.bind();
    
    Dom.addCssClass(MessageDialog.instance.object, ["dialog", "screen", "only"]);

    Application.registerEvent(document.getElementById(MessageDialog.BUTTON_OK), "click", MessageDialog.apply);
    Application.registerEvent(document.getElementById(MessageDialog.BUTTON_YES), "click", MessageDialog.apply);
    Application.registerEvent(document.getElementById(MessageDialog.BUTTON_NO), "click", MessageDialog.apply);
    Application.registerEvent(document.getElementById(MessageDialog.BUTTON_RETRY), "click", MessageDialog.apply);
    Application.registerEvent(document.getElementById(MessageDialog.BUTTON_IGNORE), "click", MessageDialog.apply);
    Application.registerEvent(document.getElementById(MessageDialog.BUTTON_CANCEL), "click", MessageDialog.apply);
};

/**
 *  Bindet die GUI-Komponente ein.
 *  @param title   Titel
 *  @param message Meldung
 *  @param options Optionen
 *  @see   MessageDialog.SYMBOL... fuer das Symbol
 *  @see   MessageDialog.BUTTON... fuer die Schaltflaechen
 *  @see   MessageDialog.FOCUS... fuer den Fokus
 *  @param call    CallBack zur Datenrueckgabe
 */
MessageDialog.show = function(title, message, options, call) {

    var object;
    var focus;

    MessageDialog.bind();
    
    object = document.getElementById(MessageDialog.DIALOG_SYMBOL);

    Dom.removeCssClass(object, [MessageDialog.SYMBOL_CRITICAL, MessageDialog.SYMBOL_QUESTION, MessageDialog.SYMBOL_EXCLAMATION, MessageDialog.SYMBOL_INFORMATION]);

    if ((options & MessageDialog.OPTION_INFORMATION) != 0) Dom.addCssClass(object, MessageDialog.SYMBOL_INFORMATION);
    else if ((options & MessageDialog.OPTION_EXCLAMATION) != 0) Dom.addCssClass(object, MessageDialog.SYMBOL_EXCLAMATION);
    else if ((options & MessageDialog.OPTION_QUESTION) != 0) Dom.addCssClass(object, MessageDialog.SYMBOL_QUESTION);
    else if ((options & MessageDialog.OPTION_CRITICAL) != 0) Dom.addCssClass(object, MessageDialog.SYMBOL_CRITICAL);

    MessageDialog.instance.call = call;
    
    title = title || document.title;

    document.getElementById(MessageDialog.DIALOG_TITLE).innerHTML = Dialog.escapeHtml(title);

    message = Dialog.escapeHtml(message);
    message = message.replace(/(\r\n)|(\n\r)|(\r)|(\n)/g, "<br>");
    message = message.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

    document.getElementById(MessageDialog.DIALOG_CONTENT).innerHTML = message;

    if ((options & (MessageDialog.OPTION_OK | MessageDialog.OPTION_YES | MessageDialog.OPTION_NO | MessageDialog.OPTION_RETRY | MessageDialog.OPTION_IGNORE | MessageDialog.OPTION_CANCEL)) == 0) options |= MessageDialog.OPTION_OK;

    if (options & MessageDialog.OPTION_NONE) options = MessageDialog.OPTION_NONE;

    document.getElementById(MessageDialog.BUTTON_OK).style.display = (options & MessageDialog.OPTION_OK) != 0 ? "inline" : "none";
    document.getElementById(MessageDialog.BUTTON_YES).style.display = (options & MessageDialog.OPTION_YES) != 0 ? "inline" : "none";
    document.getElementById(MessageDialog.BUTTON_NO).style.display = (options & MessageDialog.OPTION_NO) != 0 ? "inline" : "none";
    document.getElementById(MessageDialog.BUTTON_RETRY).style.display = (options & MessageDialog.OPTION_RETRY) != 0 ? "inline" : "none";
    document.getElementById(MessageDialog.BUTTON_IGNORE).style.display = (options & MessageDialog.OPTION_IGNORE) != 0 ? "inline" : "none";
    document.getElementById(MessageDialog.BUTTON_CANCEL).style.display = (options & MessageDialog.OPTION_CANCEL) != 0 ? "inline" : "none";
    document.getElementById(MessageDialog.BUTTON_NONE).style.display = (options & MessageDialog.OPTION_NONE) != 0 ? "inline" : "none";

    if ((options & MessageDialog.FOCUS_OK) != 0) focus = MessageDialog.BUTTON_OK;
    else if ((options & MessageDialog.FOCUS_CANCEL) != 0) focus = MessageDialog.BUTTON_CANCEL;
    else if ((options & MessageDialog.FOCUS_RETRY) != 0) focus = MessageDialog.BUTTON_RETRY;
    else if ((options & MessageDialog.FOCUS_IGNORE) != 0) focus = MessageDialog.BUTTON_IGNORE;
    else if ((options & MessageDialog.FOCUS_YES) != 0) focus = MessageDialog.BUTTON_YES;
    else if ((options & MessageDialog.FOCUS_NO) != 0) focus = MessageDialog.BUTTON_NO;

    Dialog.show(this);

    if (focus) document.getElementById(focus).focus();
    else Dialog.resetFocus(this, false);
};

/**
 *  Einsprung mit dem Aufruf einer der Schaltflaechen.
 *  @param event Event
 */
MessageDialog.apply = function(event) {

    var button;

    MessageDialog.hide();
    
    event  = event || window.event;
    button = event.target || event.srcElement;

    if (button == MessageDialog.BUTTON_OK) button = MessageDialog.OPTION_OK;
    else if (button == MessageDialog.BUTTON_YES) button = MessageDialog.OPTION_YES;
    else if (button == MessageDialog.BUTTON_NO) button = MessageDialog.OPTION_NO;
    else if (button == MessageDialog.BUTTON_RETRY) button = MessageDialog.OPTION_RETRY;
    else if (button == MessageDialog.BUTTON_IGNORE) button = MessageDialog.OPTION_IGNORE;
    else if (button == MessageDialog.BUTTON_CANCEL) button = MessageDialog.OPTION_CANCEL;
    else button = 0;

    if ((typeof MessageDialog.instance.call) == "string") {

        try {eval(MessageDialog.instance.call.replace(/\$/g, button));
        } catch (exception) {

            //keine Fehlerbehandlung vorgesehen
        }

        return;
    }

    try {MessageDialog.instance.call(button);
    } catch (exception) {

        try {MessageDialog.instance.value = button;
        } catch (exception) {

            try {MessageDialog.instance.call = button;
            } catch (exception) {

                //keine Fehlerbehandlung vorgesehen
            }
        }
    }
};