/**
 *  Konstruktor, richtet das Toc-Objekt ein.
 *  Toc baut das Inhaltsverzeichnis auf und stellt Methoden fuer den
 *  Zugriff auf dieses bereit.
 */
var Toc = function() {
};

/** Index der aktuellen Ebene 1 bis 6 */
Toc.prototype.index;

/** Inhaltsverzeichnis (Format, Nummer, Name, Alias) */
Toc.prototype.list;

/** Instanz vom Toc fuer statische Objektzugriffe */
Toc.instance;

/** Bindet die aktuelle Instanz ein. */
Toc.bind = function() {

    if (!Toc.instance) Toc.instance = new this();
};

/**
 *  Formatiert die uebergebene Zahl entsprechend dem Format.
 *  @param  number zu formatierende Zahl
 *  @param  format Format # Zahl, ## Buchstabe, ### Roemisch
 *  @return die formatierte Zahl
 */
Toc.buildNumerationDigit = function(number, format) {

    var latin;
    var result;
    var roman;

    if (format == "###") {

        roman = new Array("M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I");
        latin = new Array(1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1);

        for (loop = 0, result = ""; loop < latin.length; loop++) {

            while (number >= latin[loop]) {

                result += roman[loop];
                number -= latin[loop];
            }
        }

        return result;

    } else if (format == "##") {

        for (result = ""; number > 26; number -= 26) result += "A";

        return (result += String.fromCharCode(64 +(number ? number : -19)));
    }

    return number;
};

/**
 *  Formatiert die uebergebe TOC-Nummerierung entsprechend dem Format.
 *  @param  toc    zu formatierende TOC-Nummerierung
 *  @param  format Format # Zahl, ## Buchstabe, ### Roemisch
 *  @return die formatierte TOC-Nummerierung
 */
Toc.buildNumeration = function(toc, format) {

    var loop;
    var result;

    if (!format) format = "#";

    if (!toc) toc = new Array(0, 0, 0, 0, 0, 0);

    for (loop = 0, result = ""; loop < toc.length; loop++) {

        result += "." + Toc.buildNumerationDigit(toc[loop], format);
    }

    result = result.replace(/(^\.+)|(([\.-]|\.0)+$)/g, '');

    return result;
};

/**
 *  Erstellt einen TOC-Eintrag zum angegebenen Titel und Format.
 *  @param  level  Angabe der Tiefe/Ordnung
 *  @param  title  Titel
 *  @param  alias  Alias
 *  @param  format Format # Zahl, ## Buchstabe, ### Roemisch
 *  @return die Nummer vom TOC-Eintrag
 */
Toc.addNode = function(level, title, alias, format) {

    var entry;
    var index;
    var loop;

    Toc.bind();

    //der Toc-Index wird ggf. initial eingerichtet
    if (!Toc.instance.index) Toc.instance.index = new Array(0, 0, 0, 0, 0, 0);

    //die Toc-Liste wird ggf. initial eingerichtet
    if (!Toc.instance.list) Toc.instance.list = new Array();

    //ggf. werden Luecken durch annonyme Eintraege geschlossen
    for (loop = 0; loop < level -1 && loop < Toc.instance.index.length; loop++) {

        if (Toc.instance.index[loop] == 0) Toc.addNode(loop +1); 
    }

    //relativ zum aktuellen Level wird der Index zurueckgesetzt
    for (loop = level; loop <= Toc.instance.index.length; loop++) {

        if (loop > level) Toc.instance.index[loop -1] = 0;
    }

    //der Index wird relativ zum aktuellen Level hochgezaehlt
    Toc.instance.index[level -1] = Math.abs(Toc.instance.index[level -1]) +1;

    entry = Toc.buildNumeration(Toc.instance.index, format);
    index = Toc.buildNumeration(Toc.instance.index);
    
    title = title || "";

    //das Kapitel wird im Format, Nummer, Name, Alias im Toc registriert
    Toc.instance.list[Toc.instance.list.length] = format ? entry : "";
    Toc.instance.list[Toc.instance.list.length] = index;
    Toc.instance.list[Toc.instance.list.length] = title.replace(/^\s+|\s+$/g, '');
    Toc.instance.list[Toc.instance.list.length] = alias;

    return Toc.instance.index;
};

/**
 *  Ermittelt die TOC-Nummer zum angegebenen Kapitel.
 *  @param  chapter TOC-Nummer/TOC-Nummer formatiert/TOC-Titel
 *  @param  exact   true, wenn null zurueckgegeben werden soll, wenn
 *                  kein Kapitel ermittelt werden kann
 *  @return die ermittelte TOC-Nummer zum angegebenen Kapitel,
 *          kann diese nicht ermittelt werden, null
 */
Toc.resolve = function(chapter, exact) {

    var cursor;
    var loop;

    Toc.bind();

    if (!chapter) return !exact ? (Toc.instance.list && Toc.instance.list.length > 0) ? "1" : "0" : null;

    chapter = decodeURI(chapter);

    //die TOC-Nummer wird alternativ ermittelt
    for (loop = 0; Toc.instance.list && loop < Toc.instance.list.length; loop++) {

        if (chapter == Toc.instance.list[loop] || chapter == Toc.instance.list[loop +1]
            || chapter == Toc.instance.list[loop +2] || chapter == Toc.instance.list[loop +3]) return Toc.instance.list[loop +1];

        loop += 3;
    }

    cursor = chapter.lastIndexOf(".");

    if (cursor > 0 && !exact) return Toc.resolve(chapter.substring(0, cursor), exact);

    return !exact ? (Toc.instance.list && Toc.instance.list.length > 0) ? "1" : "0" : null;
};

/**
 *  Rueckgabe der Position des angegebenen Kapitels im Baum. Kann diese
 *  nicht ermittelt werden, wird ein Wert kleiner 0 zurueckgegeben.
 *  @param  chapter gesuchtes Kapitel
 *  @param  exact   true, wenn null zurueckgegeben werden soll, wenn
 *                  kein Kapitel ermittelt werden kann
 *  @return die Position des angegebenen Kapitels im Baum
 */
Toc.indexOf = function(chapter, exact) {

    var loop;

    chapter = Toc.resolve(chapter, exact);

    //die TOC-Nummer wird alternativ ermittelt
    for (loop = 0; chapter && Toc.instance.list && loop < Toc.instance.list.length; loop += 4) {

        if (Toc.instance.list[loop +1] == chapter) return loop;
    }

    return -1;
};

/**
 *  Rueckgabe von einem Eintrag aus dem Inhaltsverzeichnis.
 *  @return der per Index angegebene Eintrag aus dem Inhaltsverzeichnis,
 *          null wenn zum Index kein Eintrag vorliegt
 */
Toc.get = function(index) {

    Toc.bind();

    if (!Toc.instance.list || index < 0 || index >= Toc.instance.list.length) return null;

    return Toc.instance.list[index];
};

/**
 *  Rueckgabe der gesamten Anzahl von Daten im Inhaltsverzeichnis.
 *  @return die gesamte Anzahl von Daten im Inhaltsverzeichnis
 */
Toc.size = function() {

    Toc.bind();

    if (!Toc.instance.list || !Toc.instance.list.length) return 0;

    return Toc.instance.list.length
};

/**
 *  Rueckgabe von true, wenn der Toc-Objekt komplett geladen ist.
 *  @return true, wenn der Toc-Objekt komplett geladen ist
 */
Toc.completed = function() {

    Toc.bind();

    return !!Toc.instance.list;
}