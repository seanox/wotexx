/**
 *  Konstruktor, richtet das Component-Objekt ein.
 *  Abstraktes Objekt zur Abbildung von instanzierten Komponenten.
 */
var Component = function() {
};

/** Name der Komponente */
Component.prototype.context;

/** Objekt der Komponente */
Component.prototype.object;

/** Instanz der Komponente fuer statischen Zugriff */
Component.instance;

/** Bindet die Komponente ein. */
Component.bind = function() {

    if (!this.instance) {

        this.instance = new this();

        this.instance.object = document.getElementById(this.instance.context);

        if (this.customize) this.customize();
    }
};