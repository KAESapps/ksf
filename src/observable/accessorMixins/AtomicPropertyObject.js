define([
	'compose',
], function(
	compose
){
	var BasicPropObjPropertyAccessor = compose(function(source, key) {
		this._source = source;
		this._key = key;
	}, {
		_getValue: function() {
			return this._source._getValue()[this._key];
		},
		_change: function(changeArg) {
			var sourceChangeArg = {};
			sourceChangeArg[this._key] = changeArg;
			return this._source._change(sourceChangeArg);
		},
		_onChange: function(cb) {
			var key = this._key;
			return this._source._onChange(function(sourceChanges) {
				if (key in sourceChanges) {
					cb(sourceChanges[key]);
				}
			});
		},
	});

	var AtomicPropertyObject = compose(function(properties) {
		this.ctr = compose({
			_accessorFactories: {},
			value: function() {
				return this._getValue();
			},
			change: function(changeArg) {
				return this._change(changeArg);
			},
			onChange: function(cb) {
				return this._onChange(cb);
			},
			prop: function(prop) {
				return new (this._accessorFactories[prop])(this, prop);
			}
		});

		Object.keys(properties).forEach(function(prop) {
			this.addProperty(prop, properties[prop]);
		}, this);
	}, {
		addProperty: function(prop, AccessorAPI) {
			this.ctr.prototype._accessorFactories[prop] = compose(BasicPropObjPropertyAccessor, AccessorAPI);
		}
	});
	return AtomicPropertyObject;
});