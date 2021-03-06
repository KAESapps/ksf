import compose from '../../utils/compose';
var BasicPropObjPropertyAccessor = compose(function(source, key) {
    this._source = source;
    this._key = key;
}, {
    _getValue: function() {
        var sourceValue = this._source._getValue();
        if (sourceValue === undefined) {
            return undefined;
        }
        return sourceValue[this._key];
    },
    _change: function(changeArg) {
        var sourceChangeArg = {};
        sourceChangeArg[this._key] = changeArg;
        return this._source._change(sourceChangeArg)[this._key];
    },
    _onChange: function(cb) {
        var key = this._key;
        return this._source._onChange(function(sourceChanges) {
            if (sourceChanges === undefined) {
                cb(undefined);
            } else if (key in sourceChanges) {
                cb(sourceChanges[key]);
            }
        });
    },
});

var ComputedPropertyAccessor = compose(function(source) {
    this._source = source;
}, {
    _getValue: function() {
        var sourceValue = this._source._getValue();
        if (sourceValue === undefined) {
            return undefined;
        } else {
            var props = this._props;
            var values = props.map(function(prop) {
                return sourceValue[prop];
            });
            return this._computeFn.apply(null, values);
        }
    },
    _onChange: function(cb) {
        var self = this;
        var props = this._props;
        return this._source._onChange(function(sourceChanges) {
            if (sourceChanges === undefined) {
                cb(undefined);
            } else {
                if (props.some(function(prop) {
                        return prop in sourceChanges;
                    })) {
                    cb(self._getValue());
                }
            }
        });
    },
});


var PropertyObject = compose(function(properties, computedProperties) {
    this.ctr = compose({
        _accessorFactories: {},
        value: function() {
            return this._getValue();
        },
        onChange: function(cb) {
            return this._onChange(cb);
        },
        patch: function(changeArg) {
            return this._change(changeArg);
        },
        prop: function(prop) {
            return new(this._accessorFactories[prop])(this, prop);
        }
    });

    Object.keys(properties).forEach(function(prop) {
        this.addProperty(prop, properties[prop]);
    }, this);
    computedProperties && Object.keys(computedProperties).forEach(function(prop) {
        this.addComputedProperty(prop, computedProperties[prop]);
    }, this);
}, {
    addProperty: function(key, AccessorAPI) {
        this.ctr.prototype._accessorFactories[key] = compose(BasicPropObjPropertyAccessor, AccessorAPI);
    },
    addComputedProperty: function(key, AccessorMixin) {
        this.ctr.prototype._accessorFactories[key] = compose(ComputedPropertyAccessor, AccessorMixin);
    },
});
export default PropertyObject;