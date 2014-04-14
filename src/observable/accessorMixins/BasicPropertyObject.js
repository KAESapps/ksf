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
		_computeChanges: function(sourceChanges) {
			return sourceChanges[this._key];
		},
		_onChanges: function(cb) {
			var self = this;
			return this._source._onChanges(function(sourceChanges) {
				var changes = self._computeChanges(sourceChanges);
				if (changes) {
					cb(changes);
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