/**
 *  Konstruktor, richtet das Parser-Objekt ein.
 *  Parser verarbeitet und bereitet die Syntax mittels Interpreter, welche sich
 *  selbst organisieren und zur Verarbeitung vom aktuellen Dialekt registrieren.
 *  Der Parser stellt somit eine statische Komponente fuer verschiedene
 *  Syntaxen bereit.
 * 
 *  Erforderliche Abhaengigkeiten:
 *  
 *      classApplication.js
 *      classSyntax.js 
 */
var Parser = function() {
};

/** aktuelle Instanz vom Interpreter */
Parser.interpreter;

/**
 *  Rueckgabe der Syntax zum angegebenen Kapitel.
 *  @param  chapter Kapitel
 *  @return die Syntax zum angegebenen Kapitel
 */
Parser.getSource = function(chapter) {
    
    return Parser.interpreter ? Parser.interpreter.getSource(chapter) : null;
};

/**
 *  Rueckgabe vom angeforderten Kapitel.
 *  Es wird immer das Kapitel der 1. Ordnung ermittelt.
 *  @param chapter Kapitel in beliebigem Format
 *  @param exact   true, wenn nur der Inhalt vom angeforderten Kapitel
 *                 zurueckgegeben werden soll
 */
Parser.getChapter = function(chapter, exact) {

    return Parser.interpreter ? Parser.interpreter.getChapter(chapter, exact) : null;
};

/**
 *  Rueckgabe der Anzahl von Kapiteln der 1. Ordnung.
 *  @return die Anzahl Anzahl von Kapiteln der 1. Ordnung
 */
Parser.getChapterSize = function() {

    return Parser.interpreter ? Parser.interpreter.getChapters().length : 0;
};

/** Laedt und Transformiert den Inhalt. */
Parser.load = function() {

    if (!Attachments || !Attachments.completed() || !Syntax || !Syntax.getInterpreter()) {window.setTimeout(function() {Parser.load();}, 250); return;};

    //der Interpreter wird uebernommen    
    Parser.interpreter = Syntax.getInterpreter();
    
    //der Interpreter wird gestartet
    Parser.interpreter.parse();
};

/**
 *  Rueckgabe von true, wenn der Parser komplett geladen ist.
 *  @return true, wenn der Parser komplett geladen ist
 */
Parser.completed = function() {

    return Parser.interpreter ? !!Parser.interpreter.getBuilds() : false;
};

Application.registerEvent(window, "load", function() {Parser.load();});