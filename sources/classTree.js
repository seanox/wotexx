/**
 *  Konstruktor, richtet den Tree ein.
 *  Abstraktes Objekt zur Darstellung von Kapitelbaeumen als GUI-Components.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classComponent.js
 */
var Tree = function() {
};

/** Ableitung von Component.*/
Tree.prototype = Component;

/** aktuelle HTML-Struktur */
Tree.tree;

/** Bindet die Klasse als Component ein. */
Tree.bind = Component.bind;

/**
 *  Rueckgabe true, wenn der Baum komplett ist.
 *  @param  instance Instanz des anzuwendenden Objekts
 *  @return true, wenn der Baum komplett ist
 */
Tree.isCompleted = function(instance) {

    var loop;

    if (!instance || !instance.tree || !instance.tree.length) return false;

    for (loop = 0; loop < instance.tree.length; loop++) {

        if (!instance.tree[loop]) return false;
    }

    return true;
};

/**
 *  Einsprung beim Klick auf einen Knoten.
 *  Steuert das Auf- und Zuklappen vom Verzeichnisbaum.
 *  @param instance Instanz des anzuwendenden Objekts
 *  @param node     Knoten
 *  @param open     Option zum exklusiven Oeffnen
 */
Tree.onClickNode = function(instance, node, open) {

    var object;
    var state;
    
    if (!Tree.isCompleted(instance)) {window.setTimeout(function() {Tree.onClickNode(instance, node, open);}, 25); return;}
    
    if (node && (typeof node) == "string") node = document.getElementById(instance.context + "Node" + node);

    state = node ? node.getAttribute("state") : null;

    if (!node || !node.parentNode || !(state == 1 || state == -1)) return;
    
    Dom.removeCssClass(node, ["close", "open"]);

    Dom.addCssClass(node, state != 1 || open ? "open" : "close" );

    node.setAttribute("state", (state != 1 || open) ? 1 : -1);

    node.parentNode.nextSibling.style.display = (state != 1 || open) ? "block" : "none";
};

/**
 *  Erstellt einen Eintrag fuer das Inhaltsverzeichnis.
 *  @param instance Instanz des anzuwendenden Objekts
 *  @param items    Eintraege
 *  @param loop     Position im Inhaltsverzeichnis
 *  @param previous vorherige Tiefe
 *  @param level    Tiefe
 */
Tree.buildTocEntryTask = function(instance, items, loop, previous, level) {

    var cursor;
    var deep;
    var macro;
    var node;
    var result;
    var state;
    var style;
    
    //ggf. Luecken in der Tiefe werden korrigiert
    deep = (level > previous +1) ? previous +1 : level;
    
    //noch offene Strukturen werden geschlossen
    for (cursor = deep, result = ""; cursor < previous; cursor++) result += "<\/ul>";
    
    cursor = (loop /3) *4;

    if ((cursor /4) < instance.tree.length -1) {

        //die Tiefe wird ueber die Anzahl der Trennpunkte ermittelt
        state = items[cursor +5].match(/\./g);
        state = state ? state.length +1 : 1;
        state = state > level ? 1 : 0;

    } else state = 0;

    style = state ? "close" : "item";

    //Makros werden gesondert im Baum angezeigt, dabzu wird nach einem
    //Template im Format ContextNodeMacro bzw. ContextNodeMacroState
    //gesucht, ohne dieses wird der Standard verwendet
    if (items[cursor +3] && items[cursor +3].match(/(?:^macro.+)|(?:.+macro$)/i)) {
    
        macro = items[cursor +3];
    
        style += " macro";
        style += " " + macro.toLowerCase();
    }
    
    node = "<span class=\"\" context=\"\" state=\"\" id=\"\" macro=\"\"></span>";
    
    node = node.replace(/(\s+id=")(")/, '$1' + instance.context + "Node" + items[cursor +1] + '$2');
    node = node.replace(/(\s+context=")(")/, '$1' + instance.context + '$2');
    node = node.replace(/(\s+class=")(")/, '$1' + style + '$2');
    node = node.replace(/(\s+state=")(")/, '$1' + (state ? -1 : 0) + '$2');
    node = node.replace(/(\s+macro=")(")/, '$1' + (macro || "") + '$2');

    if (deep > previous) result += "<ul" + (deep > 1 ? " style=\"display:none;\"" : "") + ">";
    
    instance.tree[loop /3] = result
                           + "<li id=\"" + instance.context + (items[cursor +2] ? "Topic" : "Internal") + items[cursor +1] + "\""
                           + " context=\"" + instance.context + "\""
                           + " macro=\"" + (macro || "") + "\">"
                           + node + items[cursor +2]
                           + "</li>";
};

/**
 *  Erstellt asynchron einen Eintrag fuer das Inhaltsverzeichnis.
 *  @param instance Instanz des anzuwendenden Objekts
 *  @param items    Eintraege
 *  @param items    Eintraege
 *  @param loop     Position im Inhaltsverzeichnis
 *  @param previous vorherige Tiefe
 *  @param level    Tiefe
 */
Tree.buildTocEntry = function(instance, items, loop, previous, level) {

    //HINWEIS - Aus Gruenden der Performanz werden die Elemente vom
    //Inhaltsverzeichnis parallel erstellt
    window.setTimeout(function() {Tree.buildTocEntryTask(instance, items, loop, previous, level);}, 25);
};

/**
 *  Registriert die Events im Tree.
 *  Zur Verhinderung vom Event-Bubbling muss diese separat erfolgen.
 */
Tree.registerTocEntry = function() {

    var entries;
    var loop;

    entries = document.querySelectorAll("#TreeView span[id*=Node]");
    
    for (loop = 0; entries && loop < entries.length; loop++) {
    
        Application.registerEvent(entries[loop], "click", function(event) {
        
            var object;
            var context;
        
            event = event || window.event;
        
            object  = event.target || event.srcElement;
            context = object.getAttribute("context");
            
            event.cancelBubble = true;
            
            eval(context).onClickNode(object);        
        });
    }

    entries = document.querySelectorAll("#TreeView li[id*=Topic]");

    for (loop = 0; entries && loop < entries.length; loop++) {
    
        Application.registerEvent(entries[loop], "click", function(event) {
        
            var object;
            var context;
        
            event = event || window.event;
        
            object  = event.target || event.srcElement;
            context = object.getAttribute("context");
            
            event.cancelBubble = true;
            
            eval(context).onClickItem(object);
        });
    }
};

/**
 *  Erstellt ein komplettes Inhaltsverzeichnis zum aktuellen Stand.
 *  @param instance Instanz des anzuwendenden Objekts
 *  @param items    Eintraege
 */
Tree.buildToc = function(instance, items) {

    var level;
    var loop;
    var previous;
    var result;
    var size;

    size = items ? (items.length /4) *3 : 0;

    instance.tree = new Array(size /3);

    for (previous = loop = 0; loop < size; loop++) {

        instance.tree[loop /3] = null;

        //die Tiefe wird ueber die Anzahl der Trennpunkte ermittelt
        level = items[((loop /3) *4) +1].match(/\./g);
        level = level ? level.length +1 : 1;

        Tree.buildTocEntry(instance, items, loop, previous, level);

        loop += 2;

        previous = level;
    }
};

/**
 *  Wartet asynchron bis zur kompletten Erstellung und setzt den Inhalt.
 *  @param instance Instanz des anzuwendenden Objekts
 */
Tree.showTask = function(instance) {

    var loop;
    var result;
    var node;
    var object;

    //HINWEIS - Da das Inhaltsverzeichnis parallel erstellt wird, wird
    //der Aufbau bis zum ersten Fehlen eines Eintrags versucht. Beim
    //Fehlen wird der Aufruf zur Anzeige des Inhaltsverzeichnis
    //zeitversetzt wiederholt.

    if (!Tree.isCompleted(instance)) {window.setTimeout(function() {Tree.showTask(instance);}, 25); return;}

    for (loop = 0, result = ""; loop < instance.tree.length; loop++) {

        result += instance.tree[loop];
    }    
    
    object = document.getElementById(instance.context);
    node   = document.createElement("div");

    while (object.childNodes && object.childNodes.length > 0) object.removeChild(object.firstChild);

    object.appendChild(node);

    node.innerHTML = result;
    
    Tree.registerTocEntry();
};

/**
 *  Blendet den Tree ein.
 *  @param object optionale Angabe vom GUI-Element
 *  @param items anzuzeigende Eintraege
 */
Tree.show = function(object, items) {

    if (!items) {items = object; object = null;}

    if (!object) object = this;

    if (!object.isValid()) return;
    if (object.instance.tree) return;     
    
    Tree.buildToc(object.instance, items);

    Tree.showTask(object.instance);
};