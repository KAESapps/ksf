export default {
    _on: function(type, cb) {
        this._listeners || (this._listeners = {});
        var listeners = this._listeners[type] || (this._listeners[type] = []);
        listeners.push(cb);
    },
    _off: function(type, cb) {
        var listeners = this._listeners[type];
        var indexOfCb = listeners.indexOf(cb);
        if (indexOfCb === -1) {
            console.warn("Trying to remove a listener that is not registered");
        } else {
            listeners.splice(indexOfCb, 1);
        }
    },
    _emit: function(type, event) {
        var listeners = this._listeners && this._listeners[type];
        if (listeners) {
            listeners = listeners.slice(0);
            var length = listeners.length;
            var i = 0;
            while (i < length) {
                listeners[i++](event);
            }
        }
    }
};