/**
 *  Konstruktor richtet das Chapter-Objekt ein.
 *  Objekt zur Haltung der Daten zu einem Kapitel.
 */
var Chapter = function() {
};

/** Index des Kapitels */
Chapter.prototype.index;

/** Titel des Kapitels */
Chapter.prototype.title;

/** Inhalt des Kapitels */
Chapter.prototype.content;

/** Vorschau zum Inhalt des Kapitels */
Chapter.prototype.preview;

/** Position des Kapitels im Gesamtinhalt in Bytes */
Chapter.prototype.offset;

/** Länge des Kapitels in Bytes */
Chapter.prototype.size;