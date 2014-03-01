/**
 *  Konstruktor, richtet das Motion-Objekt ein. Motion stellt Funktionen zum
 *  Verschieben von HTML-Elementen mit der Maus bereit.
 *  
 *  Abhaengige Komponenten:
 *  
 *      classDisplay.js
 *      classApplication.js
 *
 *  Beispiele der Verwendung:
 *  
 *      JavaScript:
 *  
 *  Motion.bind(container, handle);
 *      
 *      HTML:
 *      
 *  <div style="width:100px;height:200px;background-color:#00FF00"
 *      onmousedown="Motion.bind(this);">Test</div>    
 */
var Motion = function() {
};

/** Konstante fuer den Context FocusCatch */
Motion.CONTEXT_FOCUS_CATCH = "FocusCatch";

/** aktuell registrierter MouseEvent */
Motion.mouse;

/** eingebundenes GUI-Element */
Motion.object;

/** Differenz der Mouse-Position beim Verschieben (X/Y) */
Motion.offset;

/**
 *  Einsprung vom akuellen MouseEvent zur Registrierung der Position.
 *  @param event MouseEvent
 */
Motion.registerMouse = function(event) {

    Motion.mouse = event;
};

/**
 *  Bindet das GUI-Element ein.
 *  @param object GUI-Element
 *  @param handle optionales GUI-Element zur Bewegung
 *  @param event  Ereignis bei interner Verwendung    
 */
Motion.bind = function(object, handle, event) {

    if (!handle) handle = object; 

    Motion.object = object;
    Motion.offset = [0, 0];
    
    //Belegung vom MotionOffset
    //  0 Mouse-Position X beim Anklicken
    //  1 Mouse-Position Y beim Anklicken

    if (Motion.object) Motion.object.style.position = "absolute";
    
    if (!event) Application.registerEvent(handle, "mousedown", function(event) {Motion.bind(Motion.object, Motion.object, event || true);});
    
    Motion.offset[0] = Motion.object.offsetLeft;
    Motion.offset[1] = Motion.object.offsetTop;
    
    if (Motion.mouse) {

        Motion.offset[0] = (Motion.mouse.pageX || Motion.mouse.clientX) -Motion.offset[0];
        Motion.offset[1] = (Motion.mouse.pageY || Motion.mouse.clientY) -Motion.offset[1];
    }

    if (event) Motion.onChange();
};

/** Einsprung beim Aktivieren zum Verschieben des Anzeigebereichs. */
Motion.onChange = function() {

    document.onmouseup   = Motion.onOut;
    document.onmousemove = Motion.onMove;

    if (navigator.userAgent.match(/msie/i)) return;

    document.onselectstart = function(input) {return false;};
    document.onmousedown   = function(input) {return false;};
};

/** Einsprung beim Beenden vom Verschieben des Anzeigebereichs. */
Motion.onOut = function() {

    document.onmousemove = null;
    document.onmouseup   = null;

    if (navigator.userAgent.match(/msie/i)) return;

    document.onselectstart = null;
    document.onmousedown   = null;
};

/**
 *  Einsprung beim Verschieben vom Anzeigebereich.
 *  @param event Systemereignis
 */
Motion.onMove = function(event) {

    var left;
    var height;
    var top;
    var width;
    
    if (!Motion.object) return;

    if (!event && !window) {Motion.onOut(); return;}

    if (navigator.userAgent.match(/msie/i) && window && window.event && (window.event.button & 1) != 1) {Motion.onOut(); return;}

    if (event == null) event = window.event;

    left  = (event.pageX || event.clientX) -Motion.offset[0];
    width = Display.getInnerWidth();

    if (left -Display.getScrollWidth() < 0) {Motion.offset[0] += left -Display.getScrollWidth(); left = Display.getScrollWidth()}
    if (width -Motion.object.offsetWidth -left +Display.getScrollWidth() < 0) {Motion.offset[0] -= width -Motion.object.offsetWidth -left +Display.getScrollWidth(); left = width -Motion.object.offsetWidth +Display.getScrollWidth();}
    if (Motion.offset[0] < 0) Motion.offset[0] = 0;
    if (Motion.offset[0] > Motion.object.offsetWidth) Motion.offset[0] = Motion.object.offsetWidth;

    top    = (event.pageY || event.clientY) -Motion.offset[1];
    height = Display.getInnerHeight();

    if (top -Display.getScrollHeight() < 0) {Motion.offset[1] += top -Display.getScrollHeight(); top = Display.getScrollHeight();}
    if (height -Motion.object.offsetHeight -top +Display.getScrollHeight() < 0) {Motion.offset[1] -= height -Motion.object.offsetHeight -top +Display.getScrollHeight(); top = height -Motion.object.offsetHeight +Display.getScrollHeight();}
    if (Motion.offset[1] < 0) Motion.offset[1] = 0;
    if (Motion.offset[1] > Motion.object.offsetHeight) Motion.offset[1] = Motion.object.offsetHeight;

    Motion.object.style.left = left + "px";
    Motion.object.style.top  = top + "px";

    return false;
};

/**
 *  Einsprung beim veraendern der Groesse vom Anwendungsfenster.
 *  @param event Ereignis
 */
Motion.onResize = function(event) {
    
    var left;
    var height;
    var top;
    var width;

    if (!Motion.object) return;

    left  = Motion.object.offsetLeft;
    width = Display.getInnerWidth();

    if (left -Display.getScrollWidth() < 0) left = Display.getScrollWidth();
    if (width -Motion.object.offsetWidth -left +Display.getScrollWidth() < 0) left = width -Motion.object.offsetWidth +Display.getScrollWidth();
    
    Motion.object.style.left = left + "px";

    top    = Motion.object.offsetTop;
    height = Display.getInnerHeight();
    
    if (top -Display.getScrollHeight() < 0) top = Display.getScrollHeight();
    if (height -Motion.object.offsetHeight -top +Display.getScrollHeight() < 0) top = height -Motion.object.offsetHeight +Display.getScrollHeight();
    
    Motion.object.style.top = top + "px";
};

Application.registerEvent(document, "mousemove", Motion.registerMouse);
Application.registerEvent(window, "resize", Motion.onResize);