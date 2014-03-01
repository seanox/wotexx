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

Application.registerEvent(window, "load", function() {ContentView.initialize();});