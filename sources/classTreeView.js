/**
 *  Konstruktor, richtet das TreeView-Objekt ein.
 *  TreeView stellt das Inhaltsverzeichnis als Baum dar.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js   
 *      classContentView.js 
 *      classTree.js
 *      classToc.js 
 */
var TreeView = function() {

    //Name des GUI-Elements in der HTML-Struktur
    this.context = "TreeView";
};

/** Ableitung vom Tree.*/
TreeView.prototype = Tree.prototype;

/** Bindet das GUI-Element ein. */
TreeView.bind = Tree.bind;

/** Blendet den Tree ein. */
TreeView.show = Tree.show;

/** Initialisiert den TreeView. */
TreeView.initialize = function() {

    if (!Toc || !Toc.completed()) {window.setTimeout(function() {TreeView.initialize();}, 25); return;}

    if (Toc.size <= 0) return;

    document.getElementById("TreeView").style.visibility   = "visible";
    document.getElementById("SplashView").style.visibility = "hidden";

    TreeView.show(Toc.instance.list);
};

/**
 *  Rueckgabe true, wenn alle erforderlichen HTML-Elemente enthalten sind.
 *  @return true, wenn alle erforderlichen HTML-Elemente enthalten sind
 */
TreeView.isValid = function() {

    TreeView.bind();

    try {if (TreeView.instance.object) return true;
    } catch (exception) {

        //keine Fehlerbehandlung vorgesehen
    }

    return false;
};

/**
 *  Einsprung beim Klick auf einen Knoten.
 *  Steuert das Auf- und Zuklappen vom Verzeichnisbaum.
 *  @param node Knoten
 *  @param only Option zum exklusiven Oeffnen
 */
TreeView.onClickNode = function(node, only) {

    var height;
    var offset;

    TreeView.bind();
    
    Tree.onClickNode(TreeView.instance, node, only);

    if (node && (typeof node) == "string") node = document.getElementById(TreeView.instance.context + "Node" + node);

    if (!node || !node.parentNode || !node.innerHTML) return;

    //die Hoehe des Anzeigebereichs wird (alternativ) ermittelt
    if (document.body && document.body.clientHeight) height = document.body.clientHeight;
    if (document.documentElement && document.documentElement.clientHeight) height = document.documentElement.clientHeight;
    if (window.innerHeight) height = window.innerHeight;

    //die reale Position vom Knoten wird ermittelt
    offset = node.offsetTop;

    //nur wenn der Knoten nicht im sichtbaren Bereich liegt, wird dieser
    //in die Mitte positioniert
    if (offset < 0 || offset +node.offsetHeight > height +TreeView.instance.object.scrollTop) TreeView.instance.object.scrollTop = offset -(height /2);
};

/**
 *  Einsprung beim Klicken auf einen Eintrag.
 *  @param item angeklickter Eintrag
 *  @param only Option zum exklusiven Ausfuehren
 */
TreeView.onClickItem = function(item, only) {

    var chapter;
    var index;

    //die Position im TOC wird ermittelt
    chapter = String(item.id.match(/[0-9,\.]*$/));

    if (!only) {
    
        window.setTimeout(function() {ContentView.show(chapter, true);}, 25);
        window.setTimeout(function() {TreeView.open(chapter, true);}, 25);
    }

    index = Toc.indexOf(chapter);

    if (EditorView.control && index >= 0) EditorView.show(chapter);
};

/**
 *  Oeffnet den Kompletten Zweig vom angegebenen Kapitel.
 *  @param chapter Kapitel
 *  @param only    Option zum exklusiven Oeffnen 
 */
TreeView.open = function(chapter, only) {

    if (!chapter) return;

    chapter = chapter.split(".");

    //der Baum wird ggf. aufgeklappt
    while (chapter && chapter.length > 0) {

        try {TreeView.onClickItem(chapter.join("."), only);
        } catch (exception) {

            //keine Fehlerbehandlung vorgesehen
        }
        
        try {TreeView.onClickNode(chapter.join("."), true);
        } catch (exception) {

            //keine Fehlerbehandlung vorgesehen
        }        

        chapter.pop();
    }
};

Application.registerEvent(window, "load", function() {TreeView.initialize();});