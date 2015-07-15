import compose from '../../utils/compose';
import destroy from '../../utils/destroy';
export default compose(function() {
    this._components = {};
    this._onLayoutObservers = [];
}, {
    _layout: function(layout) {
        var content = [];
        var usedCmps = this._layoutCmps = {};
        layout.forEach(function(id) {
            if (!(id in this._components)) {
                this._components[id] = this._factories[id]();
            }
            content.push(this._components[id]);
            usedCmps[id] = true;
        }, this);

        var checkUsed = function(id) {
            return id in usedCmps;
        };
        var getCmp = function(id) {
            return this._components[id];
        };

        for (var i = 0; i < this._onLayout.length; i += 2) {
            var ids = this._onLayout[i];
            var cb = this._onLayout[i + 1];
            var handler = this._onLayoutObservers[i];

            if (handler) {
                // binding actif
                if (!ids.every(checkUsed)) {
                    destroy(handler.canceler);
                    delete this._onLayoutObservers[i];
                }
            } else {
                // binding inactif
                if (ids.every(checkUsed)) {
                    this._onLayoutObservers[i] = {
                        canceler: cb.apply(this, ids.map(getCmp, this)),
                        active: true
                    };
                }
            }
        }

        this._root.content(content);
    }
});