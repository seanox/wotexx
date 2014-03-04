/**
 *  Konstruktor, richtet das Dialog-Objekt ein.
 *  Abstraktes Objekt zur Darstellung von GUI-Komponenten.
 *  
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classComponent.js 
 *      classDisplay.js
 *      classDom.js 
 *      classMotion.js
 */
var Dialog = function() {
};

/** Konstante fuer das Attribut ShieldId */
Dialog.ATTRIBUTE_SHIELD_ID = "dialogShieldId";

/** Konstante fuer das Attribut StyleScrollLeft */
Dialog.ATTRIBUTE_SCROLL_LEFT = "dialogStyleScrollLeft";

/** Konstante fuer das Attribut StyleScrollTop */
Dialog.ATTRIBUTE_SCROLL_TOP = "dialogStyleScrollTop";

/** Konstante fuer das Attribut StyleOverflow */
Dialog.ATTRIBUTE_STYLE_OVERFLOW = "dialogStyleOverflow";

/** Konstante fuer das Attribut StyleWidth */
Dialog.ATTRIBUTE_STYLE_WIDTH = "dialogStyleWidth";

/** Konstante fuer das Attribut StyleHeight */
Dialog.ATTRIBUTE_STYLE_HEIGHT = "dialogStyleHeight";

/** Konstante fuer das Attribut Binding */
Dialog.ATTRIBUTE_DIALOG_BINDING = "dialogBinding";

/** Konstante fuer das Attribut Motion */
Dialog.ATTRIBUTE_OPTION_MOTION = "dialogOptionMotion";

/** Konstante fuer das CSS-Klasse empty */
Dialog.STYLE_CLASS_EMPTY = "empty";

/** Konstante fuer den Context FocusCatch */
Dialog.CONTEXT_FOCUS_CATCH = "FocusCatch";

/** Konstante fuer den Context Title */
Dialog.CONTEXT_TITLE = "Title";

/** Konstante fuer den Context Shield */
Dialog.CONTEXT_SHIELD = "Shield";

/** Option zur Verwendung von Motion */
Dialog.OPTION_MOTION = 1;

/** Ableitung von Component.*/
Dialog.prototype = Component;

/** Option, wenn aktuelle ausgewaehlt */
Dialog.prototype.selection;

/** Option zum Sperren der GUI-Komponente */
Dialog.prototype.lock;

/** Instanz vom Dialog fuer statische Objektzugriffe */
Dialog.instance;

/** Instanz der statischen Objektueberwachung */
Dialog.watching;

/** aktuelle Schichtposition der ueberlappenden Darstellung (Z-Index) */
Dialog.level;

/** Liste der aktuell dargestellten Dialoge */
Dialog.stack;

/**
 *  Maskiert die HTML-Struktur beeinflussenden Steuerzeichen im uebergebenen
 *  Text. Rueckgabe der Text mit maskierten Steuerzeichen.
 *  @param  text zu maskierender Text
 *  @return der Text mit maskierten Steuerzeichen.
 */
Dialog.escapeHtml = function(text) {

    text = (text == null) ? "" : String(text);

    text = text.replace(/&/g, "&amp;");
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    text = text.replace(/"/g, "&#34;");
    text = text.replace(/'/g, "&#39;");

    return text;
};

/**
 *  Rueckgabe true, wurde das angegebene Feld als "leer" gekennzeichnet.
 *  @param  field zu pruefendes Feld (Element oder Id)
 *  @return true, wurde das angegebene Feld als "leer" gekennzeichnet
 */
Dialog.isFieldEmpty = function(field) {

    if ((typeof field) == "string") field = document.getElementById(field);

    return field.className.match(new RegExp("\\b" + Dialog.STYLE_CLASS_EMPTY + "\\b", "i")) != null;
};

/**
 *  Rueckgabe vom Wert des angegebenen Feld.
 *  @param  field Feld (Element oder Id)
 *  @return der Wert vom angegebenen Feld
 */
Dialog.getFieldValue = function(field) {

    if ((typeof field) == "string") field = document.getElementById(field);

    return Dialog.isFieldEmpty(field) ? "" : field.value;
};

/**
 *  Ueberwacht die Eingabe eines Feldes und setzt ggf. eine Eingabehilfe.
 *  @param field Feld
 *  @param rule  Regel fuer den Wertebereich
 *  @param style CSS-Klasse
 *  @param value Eingabehilfe
 */
Dialog.watchField = function(field, rule, style, value) {

    if ((typeof field) == "string") field = document.getElementById(field);

    if (!field) return;

    if (field.value.replace(/^\s+|\s+$/g, '') == "") {

        if (!Dialog.isFieldEmpty(field)) field.className = field.className + " " + Dialog.STYLE_CLASS_EMPTY;

        field.value = value;
    }

    Application.registerEvent(field, "focus", function() {

        if (Dialog.isFieldEmpty(field) && field.value.replace(/^\s+|\s+$/g, '') == value) field.value = "";

        field.className = field.className.replace(new RegExp("\\b" + Dialog.STYLE_CLASS_EMPTY + "\\b", "ig"), ' ').replace(/\s+/g, ' ');
    });

    Application.registerEvent(field, "blur", function() {

        if (field.value.replace(/^\s+|\s+$/g, '') == "") {

            if (!Dialog.isFieldEmpty(field)) field.className = field.className + " " + Dialog.STYLE_CLASS_EMPTY;

            field.value = value;
        }
    });
};

/** Ueberwacht und bewahrt die Anzeigte vom aktuellen Dialog. */
Dialog.watch = function() {

    var element;
    var height;
    var level;
    var nodes;
    var object;
    var width;

    if (Dialog.stack && Dialog.stack.length > 0) {

        object = Dialog.stack[Dialog.stack.length -1];

        if ((typeof object.validate).match(/^function$/i)) window.setTimeout(function() {object.validate();}, 0);
    }

    if (Dialog.watching && (!Dialog.stack || Dialog.stack.length == 0)) return;

    if (Dialog.watching) {

        level  = Dialog.stack && Dialog.stack.length > 0 ? Dialog.stack.length : 0;
        height = document.body.getAttribute(Dialog.ATTRIBUTE_SCROLL_TOP + level);
        width  = document.body.getAttribute(Dialog.ATTRIBUTE_SCROLL_LEFT + level);

        if (Display.getScrollWidth() != width || Display.getScrollHeight() != height) window.scrollTo(width, height);

        element = document.activeElement;
        object  = Dialog.stack[Dialog.stack.length -1];

        if (!object.instance || !object.instance.lock || !element) return;

        try {

            //Sonderfall Firefox: Beim Zugriff auf das aktuelle Objekt kann es
            //sich um ein Browser-Objekt (none-chrome), wie die Adresszeile
            //handeln, was zu einer Zugriffsverletzung fuehrt
            for (nodes = ""; element && element != element.parentNode; element = element.parentNode) {

                if (element.id == object.instance.context) return;

                nodes += " " + element.nodeName;
            }

        } catch (exception) {

            //keine Fehlerbehandlung vorgesehen
        }
    
        //Sonderfall Firefox: Ohne Body-Element muss sich der Fokus auf einem
        //Browser-Objekt (none-chrome) befinden
        if (nodes.match(/!(\bbody\b)|(^\s+body\b)/i)) return;

        Dialog.resetFocus(object);

        return;
    }

    Dialog.watching = window.setInterval(Dialog.watch, 0);
};

/**
 *  Erweitert das Objekt um die Fokusfalle, wenn diese nicht existiert.
 *  @param object Bezugsobjekt
 */
Dialog.addFocusCatch = function(object) {

    var element;
    var parent;

    element = document.getElementById(object.instance.context + Dialog.CONTEXT_FOCUS_CATCH + "A");

    if (!element) {

        element = document.createElement("input");

        element.setAttribute("type", "text");
        element.setAttribute("id", object.instance.context + Dialog.CONTEXT_FOCUS_CATCH + "A");
        element.setAttribute("size", "1");
        
        element.style.font     = "1px sans-serif";
        element.style.border   = "0px solid";
        element.style.margin   = "0px";
        element.style.padding  = "0px";
        element.style.width    = "1px";
        element.style.height   = "1px";
        element.style.overflow = "hidden";
        element.style.position = "absolute";    

        Application.registerEvent(element, "focus", function() {Dialog.resetFocus(object, true);});
        
        parent = object.instance.object.querySelector("*");
        
        if (parent.hasChildNodes()) parent.insertBefore(element, parent.querySelector("*"));
        else parent.appendChild(element);
    }
    
    element = document.getElementById(object.instance.context + Dialog.CONTEXT_FOCUS_CATCH + "B");

    if (!element) {

        element = document.createElement("input");

        element.setAttribute("type", "text");
        element.setAttribute("id", object.instance.context + Dialog.CONTEXT_FOCUS_CATCH + "B");
        element.setAttribute("size", "1");

        element.style.font     = "1px sans-serif";
        element.style.border   = "0px solid";
        element.style.margin   = "0px";
        element.style.padding  = "0px";
        element.style.width    = "1px";
        element.style.height   = "1px";
        element.style.overflow = "hidden";
        element.style.position = "absolute";

        Application.registerEvent(element, "focus", function() {Dialog.resetFocus(object);});
        
        object.instance.object.appendChild(element);
    }
};

/**
 *  Erweitert das Objekt um ein Shield zur Sperrung der unter dem Dialog
 *  liegenden Benutzeroberflaeche, wenn diese nicht existiert.
 *  @param object Bezugsobjekt
 */
Dialog.addShield = function(object) {

    var shield;
    
    if (object && object.instance.object && object.instance.object.getAttribute(Dialog.ATTRIBUTE_SHIELD_ID)) return;

    shield = document.createElement("div");

    shield.className = "dialog shield";
    shield.setAttribute("id", Dialog.CONTEXT_SHIELD + Application.getSerial());
    shield.setAttribute(Dialog.ATTRIBUTE_DIALOG_BINDING, object.instance.context);
    
    shield.style.display  = "none";
    shield.style.position = "absolute";    
    shield.style.zIndex   = 0;
    
    Application.registerEvent(shield, "mousedown", function(event) {
    
        var object;

        event = event || window.event;
        
        object = event.target || event.srcElement;    
        object = object ? object.getAttribute(Dialog.ATTRIBUTE_DIALOG_BINDING) : null;
        
        if (object) document.getElementById(object + Dialog.CONTEXT_FOCUS_CATCH + "B").focus();
        
        event.cancelBubble = true;
        
        if (event.stopPropagation) event.stopPropagation();
        
        return false;
    });

    object.instance.object.parentNode.insertBefore(shield, object.instance.object);
    
    object.instance.object.setAttribute(Dialog.ATTRIBUTE_SHIELD_ID, shield.getAttribute("id"));
};

/**
 *  Registriert im uebergebenen Objekt Ereignisse zu allen Elementen mit Id,
 *  wenn zum jeweiligen Element eine korrespondierende Klasse mit entsprechender
 *  on-Methode implementiert wurde. Es wird dabei nicht geprueft, ob es sich um
 *  ein vom JavaScript unterstuetztes Ereignis handelt.
 *  @param object Objekt
 */
Dialog.explain = function(object) {

    var objects;
    var loop;
    var element;
    var event;
    var method;    
    
    objects = object.instance.object.querySelectorAll("*[id]");;

    for (loop = 0; objects && loop < objects.length; loop++) {

        element = objects[loop].getAttribute("id");
        element = element.replace(new RegExp("^" +  object.instance.context), "");

        for (var entry in object) {
        
            if (typeof object[entry] != "function" || !object.hasOwnProperty(entry)) continue;
            
            event = String(entry).match(/^on([A-Z][a-z]+)/);
            
            if (!event || !event.length || event.length < 2) continue;
            
            method = "on" + event[1] + element;
            event  = event[1].toLowerCase(); 
            
            if (entry != method) continue;

            Application.registerEvent(objects[loop], event, object[entry]);            
        }
    }
};

/** 
 *  Bindet die GUI-Komponente ein.
 *  @param options Optionen zur Darstellung
 *  @see   Dialog.OPTION_MOTION, zur Verwendung von Motion
 */
Dialog.bind = function(options) {

    var object;

    if (!this.instance) {
    
        this.instance = new this();

        this.instance.object = document.getElementById(this.instance.context);

        Dialog.addFocusCatch(this);
        Dialog.addShield(this);
        
        object = document.getElementById(this.instance.context + Dialog.CONTEXT_TITLE);
        
        object.setAttribute(Dialog.ATTRIBUTE_DIALOG_BINDING, this.instance.context);
        
        options = options || 0;

        object.setAttribute(Dialog.ATTRIBUTE_OPTION_MOTION, (options & Dialog.OPTION_MOTION));

        if ((options & Dialog.OPTION_MOTION) != 0) Motion.bind(this.instance.object, object);        

        Dialog.explain(this);

        if (this.customize) this.customize();
    }
};

/**
 *  Rueckgabe true, wenn der Dialog atuell dargestellt wird.
 *  @param  object optionale Angabe der GUI-Komponente
 *  @return true, wenn der Dialog atuell dargestellt wird
 */
Dialog.isVisible = function(object) {

    if (!object) object = this;

    object.bind();
    
    try {return object.instance.object.style.display  == "inline";
    } catch (exception) {
    
        return false;
    }
};

/**
 *  Blendet die GUI-Komponente ein.
 *  @param object optionale Angabe der GUI-Komponente
 */
Dialog.show = function(object) {

    var height;
    var level;
    var loop;
    var objects;
    var shield;
    var width;

    if (!object) object = this;
    
    object.bind();    
    
    if (object.isValid && !object.isValid()) return;
    
    level = ++Dialog.level;
    
    //der Body und damit die Seite, werden fixiert
    document.body.setAttribute(Dialog.ATTRIBUTE_STYLE_OVERFLOW + level, document.body.style.overflow);
    document.body.setAttribute(Dialog.ATTRIBUTE_STYLE_WIDTH + level, document.body.style.width);
    document.body.setAttribute(Dialog.ATTRIBUTE_STYLE_HEIGHT + level, document.body.style.height);
    document.body.setAttribute(Dialog.ATTRIBUTE_SCROLL_LEFT + level, Display.getScrollWidth());
    document.body.setAttribute(Dialog.ATTRIBUTE_SCROLL_TOP + level, Display.getScrollHeight());
    
    document.body.style.overflow = "hidden";
    document.body.style.width    = "100%";
    document.body.style.height   = "100%";
    
    height = Display.getSideHeight() +screen.availHeight;
    width  = Display.getSideWidth() +screen.availWidth;

    shield = document.getElementById(object.instance.object.getAttribute(Dialog.ATTRIBUTE_SHIELD_ID));        

    shield.style.display  = "block";
    shield.style.height   = height + "px";
    shield.style.width    = width  + "px";
    shield.style.right    = "0px";
    shield.style.bottom   = "0px";
    shield.style.zIndex   = level;

    //Sonderfall Firefox: Die Eigenschaft zur nachtraeglichen Veraenderung des
    //Groesse von Textarea-Elementen wird per CSS unterbunden
    objects = Dom.getElementsByTagName(object.instance.object, "textarea");

    for (loop = 0; objects && loop < objects.length; loop++) {

        objects[loop].style.resize = "none";
    }

    object.instance.object.style.position = "absolute";
    object.instance.object.style.top      = "-10000px";
    object.instance.object.style.left     = "-10000px";
    object.instance.object.style.display  = "inline";
    object.instance.object.style.zIndex   = level;

    height = (Display.getInnerHeight() /2) +Display.getScrollHeight() -((object.instance.object.offsetHeight) /2);
    width  = (Display.getInnerWidth() /2) +Display.getScrollWidth() -(object.instance.object.offsetWidth /2);

    object.instance.object.style.left = width  + "px";
    object.instance.object.style.top  = height + "px";  

    if (object.instance.selection === false) {

        object.instance.object.setAttribute("document.onselectstart", document.onselectstart);

        document.onselectstart = function(input) {return false;};
    }

    if (!Dialog.stack) Dialog.stack = new Array();

    Dialog.stack.push(object);

    Dialog.watch();
};

/**
 *  Setzt den Fokus auf das erste bzw. letzte Eingabe- oder Bedienfeld.
 *  Optional kann der Standard-Fokus mit der CSS-Klasse "focus" gesetzt werden.
 *  @param object  GUI-Komponente als Objekt oder Id
 *  @param reverse true, zur Anwahl vom ersten Eingabe- oder Bedienfeld
 */
Dialog.resetFocus = function(object, reverse) {

    var context;
    var elements;
    var entry;
    var loop;

    context = ((typeof object) == "string") ? object : object.instance.context;
    object  = ((typeof object) == "string") ? document.getElementById(object) : object.instance.object;

    //Sonderfall Firefox: Klick und Fokus sind nur fuer bestimmte Eingabeelmente
    //zulaessig, daher werden diese ermittelt und verwendet
    elements = Dom.getElementsByTagName(object, /^(button|input|select)$/i);

    for (loop = 0; elements && loop < elements.length; loop++) {

        entry = elements[reverse ? elements.length -1 -loop : loop];

        if (entry.getAttribute("id") == context + Dialog.CONTEXT_FOCUS_CATCH + "A"
            || entry.getAttribute("id") == context + Dialog.CONTEXT_FOCUS_CATCH + "B"
            || (entry.getAttribute("type") || "").match(/hidden/i)
            || (entry.style.display || "").match(/none/i)
            || entry.disabled) continue;
            
        try {entry.focus(); break;
        } catch (exception) {
        
            //keine Fehlerbehandlung vorgesehen
        }
    }

    //optional wird nach dem ersten Element mit der CSS-Klasse focus gesucht
    entry = object.querySelector(".focus");
    
    try {entry.focus();
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    try {if ("value" in object) object.focus();
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    try {if ("value" in object) object.click();
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }
};

/**
 *  Blendet die GUI-Komponente aus.
 *  @param object optionale Angabe der GUI-Komponente
 */
Dialog.hide = function(object) {

    var shield;

    if (!object) object = this;
    
    object.bind();

    if (object.isValid && !object.isValid()) return;

    shield = object.instance.object.getAttribute(Dialog.ATTRIBUTE_SHIELD_ID);
    shield = document.getElementById(shield);
    
    shield.style.display = "none";
    shield.style.zIndex  = 0;
    
    try {document.body.style.overflow = document.body.getAttribute(Dialog.ATTRIBUTE_STYLE_OVERFLOW + Dialog.level);
    } catch (exception) {
    
        //keine Fehlerbehandlung vorgesehen
    }
    
    document.body.style.width  = document.body.getAttribute(Dialog.ATTRIBUTE_STYLE_WIDTH + Dialog.level);
    document.body.style.height = document.body.getAttribute(Dialog.ATTRIBUTE_STYLE_HEIGHT + Dialog.level);
    
    object.instance.object.style.display = "none";
    object.instance.object.style.zIndex  = 0;

    if (object.instance.selection === false) document.onselectstart = object.instance.object.getAttribute("document.onselectstart");

    Dialog.stack.pop();

    Dialog.level = Dialog.stack.length > 0 ? Dialog.stack[Dialog.stack.length -1].instance.object.style.zIndex : Dialog.level -1;
};

/** Initialisiert der Dialogdarstellung. */
Dialog.initialize = function() {

    var elements;
    var loop;

    Dialog.level = 0;

    elements = Dom.getElementsByTagName(document);

    for (loop = 0; elements && loop < elements.length; loop++) {

        if (!elements[loop].style) continue;

        Dialog.level = Math.max(Dialog.level, Number(elements[loop].style.zIndex));
    }
};

/**
 *  Einsprung beim veraendern der Groesse vom Anwendungsfenster.
 *  @param event Ereignis
 */
Dialog.onResize = function(event) {

    var loop;
    var object;

    if (!Dialog.stack || !Dialog.stack.length) return;
    
    for (loop = 0; loop < Dialog.stack.length; loop++) {

        try {
        
            object = Dialog.stack[loop].instance.object;
        
            if (!object.getAttribute(Dialog.ATTRIBUTE_OPTION_MOTION)) Display.centerElement(object);
        
        } catch (exception) {
        
            continue;
        }
    }
};

Application.registerEvent(window, "load", function() {Dialog.initialize();});
Application.registerEvent(window, "resize", function() {Dialog.onResize();});