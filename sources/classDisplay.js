/**
 *  Konstruktor, richtet das Display-Objekt ein.
 *  Display stellt Methoden fuer den Umgang mit der Anzeige bereit.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 */
var Display = function() {
};

/** 
 *  Initialisiert die Fenster-Darstellung.
 *  Position und Groesse werden mit dem Meta-Tag http-equiv:x-ua-window gesetzt,
 *  unterstuetzen top|left|bottom|right|height|width mit Werten in 'px' und '%'.
 */
Display.initialize = function() {

    var options;
    var display;
    
    options = Application.getStartParameter();

    if (options.refresh) return;

    options = Application.getMetaParameter("x-ua-window") || "";
    display = {top:0, left:0, bottom:0, right:0, width:0, height:0, move:false};    
    
    options.replace(/[^;]*/g, function(match) {
    
        match.replace(/(?:\s*(.*?)\s*=\s*(.*)\s*)|(?:\s*([^=]*)\s*)/, function(match, key, value, option) {

            if (!(value || key || option)) return;
            
            if (!value || !key || !key.match(/^(?:top|left|bottom|right|height|width)$/i)) return;

            key = key.toLowerCase();
            
            if (value.match(/\%$/)) {
                
                try {value = parseFloat(value.substring(0, value.length -1)) *0.01;
                } catch (exception) {
                
                    return;
                }
              
                if (key == "top" || key == "bottom" || key == "height") value = screen.availHeight *value;
                else if (key == "left" || key == "right" || key == "width")   value = screen.availWidth *value;

            } else if (value.match(/px$/)) {
            
                try {value = parseFloat(value.substring(0, value.length -2));
                } catch (exception) {

                    return;
                }

            } else return;
            
            if (key == "top" || key == "bottom" || key == "left" || key == "right") display.move = true;

            if (key == "top")         display.top = value;
            else if (key == "bottom") display.bottom = value;
            else if (key == "left")   display.left = value;
            else if (key == "right")  display.right = value;
            else if (key == "height") display.height = value;
            else if (key == "width")  display.width = value;
        });
    });
    
    if (display.left != 0 && display.right != 0) display.width = Math.abs(display.right -display.left);
    if (display.top != 0 && display.bottom != 0) display.height = Math.abs(display.bottom -display.top);
    
    if (display.left == 0 && display.right != 0) display.left = screen.availWidth -display.width -display.right;
    if (display.top == 0 && display.bottom != 0) display.top = screen.availHeight -display.height -display.bottom;

    if (display.width != 0 || display.height != 0) window.resizeTo(display.width, display.height);
    if (display.move) window.moveTo(display.left, display.top);
};

/**
 *  Ermittelt browseruebergreifend die Scroll-Hoehe der Seite gesamt.
 *  @param  object optional HTML-Element
 *  @return die Scroll-Hoehe der Seite gesamt
 */
Display.getScrollHeight = function(object) {

    if (object) return Math.max(object.pageYOffset || 0, object.scrollTop || 0);                    

    return Math.max(Math.max(window.pageYOffset || 0, document.documentElement ? document.documentElement.scrollTop : 0),
                    document.body ? document.body.scrollTop : 0);
};

/**
 *  Ermittelt browseruebergreifend die Scroll-Weite der Seite gesamt.
 *  @param  object optional HTML-Element 
 *  @return die Scroll-Weite der Seite gesamt
 */
Display.getScrollWidth = function(object) {

    if (object) return Math.max(object.pageXOffset || 0, object.scrollLeft || 0);                    

    return Math.max(Math.max(window.pageXOffset || 0, document.documentElement ? document.documentElement.scrollLeft : 0),
                    document.body ? document.body.scrollLeft : 0);
};

/**
 *  Ermittelt browseruebergreifend die Hoehe der Seite gesamt.
 *  @return die Hoehe der Seite gesamt
 */
Display.getSideHeight = function() {

    return Math.max(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
                    Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
                    Math.max(document.body.clientHeight, document.documentElement.clientHeight));
};

/**
 *  Ermittelt browseruebergreifend die Weite der Seite gesamt.
 *  @return die Weite der Seite gesamt
 */
Display.getSideWidth = function() {

    return Math.max(Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
                    Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
                    Math.max(document.body.clientWidth, document.documentElement.clientWidth));
};

/**
 *  Ermittelt browseruebergreifend die innere Hoehe.
 *  @return die innere Hoehe
 */
Display.getInnerHeight = function() {

    if (typeof (window.innerHeight) == "number") return window.innerHeight;
    if (document.documentElement && document.documentElement.clientHeight) return document.documentElement.clientHeight;
    if (document.body && document.body.clientHeight) return document.body.clientHeight;

    return -1;
};

/**
 *  Ermittelt browseruebergreifend die innere Weite.
 *  @return die innere Weite
 */
Display.getInnerWidth = function() {

    if (typeof (window.innerWidth) == "number") return window.innerWidth;
    if (document.documentElement && document.documentElement.clientWidth) return document.documentElement.clientWidth;
    if (document.body && document.body.clientWidth) return document.body.clientWidth;

    return -1;
};

/**
 *  Positioniert das angegebene HTML-Element in der Fenstermitte.
 *  @param  object HTML-Element 
 */
Display.centerElement = function(object) {

    if (!object) return;

    height = (Display.getInnerHeight() /2) +Display.getScrollHeight() -((object.offsetHeight) /2);
    width  = (Display.getInnerWidth() /2) +Display.getScrollWidth() -(object.offsetWidth /2);

    object.style.left = width  + "px";
    object.style.top  = height + "px";  
};

Display.initialize();