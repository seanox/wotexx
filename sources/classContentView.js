/**
 *  Konstruktor, richtet das ContentView-Objekt ein.
 *  ContentView stellt den Inhalt eines Kapitels dar.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classComponent.js
 *      classTreeView.js
 *      classToc.js 
 *      classParser.js 
 */
var ContentView = function () {

    //Name der Components im DOM
    this.context = "ContentView";
};

/** Ableitung von Component.*/
ContentView.prototype = Component;

/** aktuell angezeigtes Kapitel */
ContentView.prototype.chapter;

/** Cache der bereits aufbereiteten Kapitel der 1. Ordnung */
ContentView.prototype.chapters;

/** Bindet die Klasse als GUI-Component ein. */
ContentView.bind = Component.bind;

/** Assoziatives Array von Events und Listener */
ContentView.listener;

/** Konstante fuer das Event call */
ContentView.EVENT_CALL = "call";

/** Konstante fuer das Event prepare */
ContentView.EVENT_PREPARE = "prepare";

/** Konstante fuer das Event show */
ContentView.EVENT_SHOW = "show";

/** Konstante fuer das Event blind */
ContentView.EVENT_BLIND = "blind";

/** Initialisiert die ContentView. */
ContentView.initialize = function() {

    var options;
    var chapter;
    
    if (!Parser || !Parser.completed()) {window.setTimeout(function() {ContentView.initialize();}, 25); return;}
    
    if (Parser.getChapterSize()) {
    
        document.getElementById("ContentView").style.visibility = "visible";
        document.getElementById("SplashView").style.visibility  = "hidden";
        
        options = Application.getStartParameter(true);
       
        if (Parser.getChapterSize() > 0) ContentView.show(options ? options[0] : options);
        else if (EditorView.isAvailable()) EditorView.open();
        else document.getElementById("SplashView").style.visibility = "visible";
    
    } else document.getElementById("SplashView").style.visibility  = "visible";
};

/**
 *  Rueckgabe true, wenn alle erforderlichen HTML-Elemente enthalten sind.
 *  @return true, wenn alle erforderlichen HTML-Elemente enthalten sind
 */
ContentView.isValid = function() {

    ContentView.bind();

    try {if (ContentView.instance.object) return true;
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    return false;
};

/**
 *  Ruft das Makros des Kapitels bei Anforderung auf.
 *  Ausgenommen wenn das Kapitel zum Bearbeiten geoeffnet wird.
 *  Rueckgabe false unterdrueckt die Anzeige des Kapitels.
 *  @param  chapter Kapitel
 *  @return false unterdrueckt die Anzeige des Kapitels
 */
ContentView.call = function(chapter) {

    var entry;
    var index;
    var macro;

    //ist der Editor aktiviert, wird der Aufruf ignoriert
    if (EditorView.control) return true;
    
    ContentView.fireEvent(ContentView.EVENT_CALL, [chapter]);

    index = Toc.indexOf(chapter);

    if (index < 0) return true;

    entry = Toc.get(index +3);

    if (!entry || !entry.match(/^macro+/i)) return true;
    
    try {macro = eval(entry);
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }
      
    if (macro && macro.call) macro = macro.call(chapter);

    return macro == null || macro;    
};

/**
 *  Ruft die Makros des Kapitels beim Kapitelwechsel der 1. Ordnung auf.
 *  Ausgenommen wenn das Kapitel zum Bearbeiten geoeffnet wird.
 *  @param chapter Kapitel
 */
ContentView.prepare = function(chapter) {

    var loop;
    var entry;
    var size;
    var macro;

    ContentView.bind();
    
    ContentView.fireEvent(ContentView.EVENT_PREPARE, [chapter]);

    chapter = Toc.resolve(chapter);
    chapter = String(chapter).split(".");

    if (!chapter || chapter.length <= 0) return;

    chapter = Number(chapter[0]);

    if (chapter == ContentView.instance.chapter) return;

    //ist der Editor aktiviert, wird der Aufruf ignoriert
    if (EditorView.control) return true;

    size = Toc.size();

    for (loop = 0; loop < size; loop += 4) {

        entry = String(Toc.get(loop +1)).split(".");

        if (!entry || entry.length <= 0) continue;

        entry = Number(entry[0]);

        if (entry < chapter) continue;
        if (entry > chapter) break;

        entry = Toc.get(loop +3);
        
        if (!entry || !entry.match(/^macro+/i)) continue;

        try {macro = eval(entry);
        } catch (exception) {

            //keine Fehlerbehandlung vorgesehen
        }
          
        if (macro && macro.prepare) macro = macro.prepare(Toc.get(loop +1));        
    }
};

/**
 *  Ruft das Makros des Kapitels beim Schliessen auf.
 *  @param chapter Kapitel
 */
ContentView.blind = function(chapter) {
    
    ContentView.fireEvent(ContentView.EVENT_BLIND, [chapter]);

    chapter = Toc.indexOf(chapter);

    if (chapter < 0) return true;

    chapter = Toc.get(chapter +3);

    if (!chapter || !chapter.match(/^macro+/i)) return true;

    try {eval(chapter + ".blind()");
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }
};

/**
 *  Positioniert, das angegebene Kapitel an der oberster Bildposition.
 *  @param chapter Kapitel
 */
ContentView.scrollTo = function(chapter) {

    var object;
    var offset;

    ContentView.bind();

    chapter = document.getElementById("Chapter" + chapter);

    //der Container fuer den Inhalt wird ermittelt
    object = document.getElementById(ContentView.instance.context);

    offset = 0;

    while (true) {

        if (!chapter.nodeName.match(/^tr$/i)) offset += chapter.offsetTop;

        chapter = chapter.parentNode;

        if (!chapter || (chapter.id && chapter.id.match(/^(((chapter|content)[\d.]*)|ContentViewcontent)$/i))) break;
    }

    try {ContentView.instance.object.scrollTop = offset;
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    try {ContentView.instance.object.scrollLeft = 0;
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    try {if (!navigator.userAgent.match(/opera/i)) object.style.visibility = "visible";
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }
};

/**
 *  Blendet die angeforderte Seite ein und setzt den Fokus auf das
 *  angeforderte Kapitel.
 *  @param chapter TOC-Nummer/TOC-Nummer formatiert/TOC-Titel
  */
ContentView.show = function(chapter) {

    var entry;
    var index;
    var nodes;
    var object;
    var part;

    ContentView.bind();
    
    ContentView.fireEvent(ContentView.EVENT_SHOW, [chapter]);

    if (!ContentView.isValid()) return;

    //die Position im TOC wird ermittelt
    index = Toc.resolve(chapter);
    nodes = index.split(".");
    part  = parseInt(nodes[0]);

    //ggf. wird das Macro-Kapitel ueber das Ausblenden informiert
    if (ContentView.instance.chapter && ContentView.instance.chapter != part) ContentView.blind(ContentView.instance.chapter);

    //ggf. wird das Macro vom Kapitel angefordert
    if (!ContentView.call(chapter)) return;

    //ggf. wird der Baum aufgeklappt
    window.setTimeout(function() {TreeView.open(index, true);}, 25);

    if (ContentView.instance.chapter != part) {

        object = ContentView.instance.object;

        try {if (!navigator.userAgent.match(/opera/i)) object.style.visibility = "hidden";
        } catch (exception) {

            //keine Fehlerbehandlung vorgesehen
        }

        //ggf. wird die Anzahl der Kapitel 1. Ordnung ermittelt
        if (!ContentView.instance.chapters) ContentView.instance.chapters = new Array(Parser.getChapterSize());

        entry = ContentView.instance.chapters[part -1];

        if (!entry) {

            entry = document.createElement("div");

            if (object.firstChild) object.replaceChild(entry, object.firstChild); else object.appendChild(entry);

            entry.innerHTML = Parser.getChapter(chapter);

            ContentView.instance.chapters[part -1] = entry;

        } else object.replaceChild(entry, object.firstChild);

        //ggf. werden Macro-Kapitel initialisiert
        ContentView.prepare(chapter);
    }

    ContentView.instance.chapter = part;

    //ggf. wird das Kapitel in den Sichbereich geholt
    window.setTimeout(function() {ContentView.scrollTo(index);}, 25);
};

/**
 *  Prueft und filter gueltige Events.
 *  @param  event Event
 *  @return event or null
 */
ContentView.filterEvent = function(event) {
    
    var pattern;

    pattern = "^" + ContentView.EVENT_CALL
            + "|" + ContentView.EVENT_PREPARE
            + "|" + ContentView.EVENT_SHOW
            + "|" + ContentView.EVENT_BLIND + "$";
    
    if (!event || !event.match(new RegExp(pattern), "i")) return null;

    return event.toLowerCase();
};

/**
 *  Hebt die Registrierung eines Listeners zu einem Event auf.
 *  @param event Event
 *  @param call  Listener
 */
ContentView.removeEventListener = function(event, call) {
    
    var loop;
    
    event = ContentView.filterEvent(event);
    
    if (!event) return;
    if (!ContentView.listener) return;
    if (!ContentView.listener[event]) return;
    
    for (loop = 0; loop < ContentView.listener[event].length; loop++) {
        
        if (ContentView.listener[event][loop] != call) continue;
        
        ContentView.listener[event].splice(loop, 1);
            
        return;
    }
};

/**
 *  Registriert einen Listener zu einem Event.
 *  @param event Event
 *  @param call  Listener
 */
ContentView.registerEventListener = function(event, call) {
    
    var loop;
    
    event = ContentView.filterEvent(event);
    
    if (!event) return;
    if (!ContentView.listener) ContentView.listener = new Object();
    if (!ContentView.listener[event]) ContentView.listener[event] = new Array();

    for (loop = 0; loop < ContentView.listener[event].length; loop++) {
        
        if (ContentView.listener[event][loop] == call) return;
    }
    
    ContentView.listener[event][ContentView.listener[event].length] = call;
};

/**
 *  Feuert einen Event zu einem Listener.
 *  @param call    Listener
 *  @param options Argumente
 *  @param wait    option beim asynchronen Aufruf
 */
ContentView.fireEventTask = function(call, options, wait) {
    
    var string;
    var loop;
    
    if (!wait) {window.setTimeout(function() {ContentView.fireEventTask(call, options, true);}, 0); return;}

    for (loop = 0, string = "";  options && loop < options.length; loop++) {
        
        string += (loop > 0 ? "," : "") + "options[" + loop + "]";
    }

    try {eval("call(" + string + ")");
    } catch (exception) {

        return;
    }
};

/**
 *  Feuert einen Event zu allen registrierten Listenern.
 *  @param event   Event
 *  @param options Argumente
 */
ContentView.fireEvent = function(event, options) {
    
    var loop;
    var calls;
    
    event = ContentView.filterEvent(event);
    
    if (!event) return;
    if (!ContentView.listener) return;
    if (!ContentView.listener[event]) return;

    for (loop = 0; loop < ContentView.listener[event].length; loop++) {
        
        ContentView.fireEventTask(ContentView.listener[event][loop], options);
    }
};

Application.registerEvent(window, "load", function() {ContentView.initialize();});