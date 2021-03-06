import compose from '../utils/compose';
import _Evented from '../base/_Evented';
// s'occupe uniquement du mapping clé/valeur mais sans s'occuper de la notion d'ajout ou de suppression de clé. En fait, toutes les clés existent théoriquement et pointent vers la valeur null par défaut jusq'à ce qu'on les fasse pointer vers autre chose.
// Il n'est pas possible d'itérer sur les clés non null
export default compose(_Evented, function(initValue) {
    this._storage = initValue || {}; // à l'avenir ça pourrait être un weakMap
}, {
    // @param change objet de la forme {key1: value1, key2: value2, ...}
    change: function(change) {
        var storage = this._storage;
        Object.keys(change).forEach(function(key) {
            if (change[key] === null) {
                delete storage[key];
            } else {
                storage[key] = change[key];
            }
        });
        this._emit('change', change);
    },
    onChange: function(cb) {
        return this._on('change', cb);
    },
    valueOfKey: function(key) {
        return key in this._storage ? this._storage[key] : null;
    },
});