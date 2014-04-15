define([
	'compose',
], function(
	compose
){
	var PatchableValueAPI = {
		value: function(value) {
			if (arguments.length) {
				this._change({ value: value });
			} else {
				return this._getValue();
			}
		}
	};

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
			this._source._change(sourceChangeArg);
		},
		_onChanges: function(cb) {
			var key = this._key;
			return this._source._onChanges(function(sourceChanges) {
				if (key in sourceChanges) {
					cb(sourceChanges[key]);
				}
			});
		},
	});

	var BasicPropertyObject = compose(function(properties) {
		this.ctr = compose(PatchableValueAPI, {
			_accessorFactories: {},
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
	return BasicPropertyObject;
});