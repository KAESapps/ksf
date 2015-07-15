import compose from '../utils/compose';
import _Evented from '../base/_Evented';
export default compose(_Evented, function(value) {
    this._value = value || {};
}, {
    change: function(change) {
        var self = this;
        var value = this._value;
        Object.keys(change).forEach(function(key) {
            var changeAtKey = change[key];
            if ('set' in changeAtKey) {
                // TODO: vérifier que la clé existe bien
                value[key] = changeAtKey.set;
            }
            if ('remove' in changeAtKey) {
                // TODO: vérifier que la clé existe bien
                changeAtKey.remove = value[key]; // permet aux observateurs de connaitre la valeur supprimée
                delete value[key];
            }
            if ('add' in changeAtKey) {
                // TODO: vérifier que la clé n'existe pas déjà
                value[key] = changeAtKey.add;
            }
        });
        self._emit('change', change);
    },
    value: function() {
        if (arguments.length) {
            console.warn("Setting a value is not implemented yet");
            // TODO: make a diff
        } else {
            return this._value;
        }
    },
    onChange: function(cb) {
        return this._on('change', cb);
    },
    remove: function(key) {
        var arg = {};
        arg[key] = {
            remove: true
        };
        return this.change(arg);
    },
    add: function(key, value) {
        var arg = {};
        arg[key] = {
            add: value
        };
        return this.change(arg);
    },
    set: function(key, value) {
        var arg = {};
        arg[key] = {
            set: value
        };
        return this.change(arg);
    },
    setOrAdd: function(key, value) {
        if (key in this._value) {
            this.set(key, value);
        } else {
            this.add(key, value);
        }
    },
    keys: function() {
        return Object.keys(this._value);
    },
    removeAll: function() {
        return this.change(this.keys().reduce(function(change, key) {
            change[key] = {
                remove: true
            };
        }, {}));
    },
});