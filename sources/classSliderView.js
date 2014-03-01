/**
 *  Konstruktor, richtet das SliderView-Objekt ein.
 *  SliderView stellt den Trenner zwischen Naviagtion und Inhalt dar.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classComponent.js
 *      classDisplay.js
 */
var SliderView = function() {

    //Name der Components im DOM
    this.context = "SliderView";
};

/** Ableitung von Component*/
SliderView.prototype = Component;

/** Bindet die Klasse als GUI-Component ein. */
SliderView.bind = Component.bind;

/** Zeitpunkt der letzten Positionsaenderung */
SliderView.timing;

/** Zwischenspeicher vom Inhalt bei Ausblenden */
SliderView.views;

/** Initialisiert die SliderView. */
SliderView.initialize = function() {

    if (!Parser || !Parser.completed()) {window.setTimeout(function() {SliderView.initialize();}, 25); return;}
    
    if (Parser.getChapterSize() <= 0) return;

    document.getElementById("SliderView").style.visibility = "visible";
    document.getElementById("SplashView").style.visibility = "hidden";

    SliderView.bind();

    Application.registerEvent(SliderView.instance.object, "mousedown", SliderView.onChange);
};

/**
 *  Rueckgabe true, wenn alle erforderlichen HTML-Elemente enthalten sind.
 *  @return true, wenn alle erforderlichen HTML-Elemente enthalten sind
 */
SliderView.isValid = function() {

    SliderView.bind();

    try {

        if (SliderView.instance.object
            && document.getElementById("TreeView")
            && document.getElementById("SliderView")
            && document.getElementById("ContentView")) return true;

    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    return false;
};

/** Einsprung beim Aktivieren zum Verschieben des Anzeigebereichs. */
SliderView.onChange = function(event) {

    if (!event) event = window.event;

    if (!event || ((event.which || event.button) & 1) != 1) return;

    document.onmouseup   = SliderView.onOut;
    document.onmousemove = SliderView.onMove;
};

/** Einsprung beim Beenden vom Verschieben des Anzeigebereichs. */
SliderView.onOut = function() {

    document.onmousemove = null;
    document.onmouseup   = null;
};

/**
 *  Einsprung beim Verschieben vom Anzeigebereich.
 *  @param event Systemereignis
 */
SliderView.onMove = function(event) {

    var toc;
    var slide;
    var view;
    var left;
    var width;
    
    SliderView.bind();

	if (!event) event = window.event;

	if (!event || ((event.which || event.button) & 1) != 1) {SliderView.onOut(); return;}

    width = Display.getSideWidth();
    
    left = event.pageX || event.clientX;
    left = (left *100) /(width == 0 ? 1 : width);
    left = (left < 0) ? 0 : (left > 100) ? 100 : left;
    
    if ((width *left /100) < 0) left = 100 /width;
    if (-((width *left /100) -width) < 0) left = 100;
        
    toc   = document.getElementById("TreeView");
    slide = document.getElementById("SliderView");
    view  = document.getElementById("ContentView"); 
        
    window.setTimeout(function() {toc.style.width  = left + "%";}, 0);
    window.setTimeout(function() {slide.style.left = left + "%";}, 0);
    window.setTimeout(function() {
    
    view.style.left  = left + "%";
    view.style.width = (100 -left) + "%";}, 0);

    return false;
};

/**
 *  Ueberwacht die Benutzeroberfläche und blendet bei Bedarf die Inhalte von
 *  Tree und View aus Gruenden der Performance aus und ein.
 */
SliderView.watch = function() {

    var meta;
    var toc;
    var txt;
    
    toc = document.getElementById("TreeView");    
    txt = document.getElementById("ContentView");  
    
    if (document.onmousemove != SliderView.onMove) {
    
        meta = SliderView.views;    
        
        if (meta) {
    
            SliderView.views.toc.style.display    = SliderView.views.tocDisplay;
            SliderView.views.tocParent.scrollLeft = SliderView.views.tocScrollWidth;
            SliderView.views.tocParent.scrollTop  = SliderView.views.tocScrollHeight;
            
            SliderView.views.txt.style.display    = SliderView.views.txtDisplay;
            SliderView.views.txtParent.scrollLeft = SliderView.views.txtScrollWidth;
            SliderView.views.txtParent.scrollTop  = SliderView.views.txtScrollHeight;

            SliderView.views = null;
        }

    } else if (!SliderView.views) {
    
        meta = {toc:toc.querySelector("*"), tocParent:toc, tocDisplay:toc.querySelector("*").style.display,
                tocScrollWidth:Display.getScrollWidth(toc), tocScrollHeight:Display.getScrollHeight(toc),
                txt:txt.querySelector("*"), txtParent:txt, txtDisplay:txt.querySelector("*").style.display,
                txtScrollWidth:Display.getScrollWidth(txt), txtScrollHeight:Display.getScrollHeight(txt)};

        if (!SliderView.views) {

            SliderView.views = meta;
            
            SliderView.views.toc.style.display = "none";
            SliderView.views.txt.style.display = "none";
        }  
    }

    window.setTimeout(function() {SliderView.watch();}, 25);
};

Application.registerEvent(window, "load", function() {SliderView.initialize();});
Application.registerEvent(window, "load", function() {SliderView.watch();});