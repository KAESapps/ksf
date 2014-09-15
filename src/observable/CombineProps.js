define([
	'compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
) {
	return compose(_Evented, function(props) {
		var self = this;
		this.props = props;
		Object.keys(props).forEach(function(prop) {
			var observable = props[prop];
			observable.onChange(function(change) {
				if (self._changing) {
					self._changingValue[prop] = change;
				} else {
					var compositeChange = {};
					compositeChange[prop] = change;
					self._emit('change', compositeChange);
				}
			});
		});
	}, {
		value: function() {
			var props = this.props;
			return Object.keys(props).map(function(prop) {
				return props[prop].value();
			});
		},
		change: function(change) {
			this._changing = true;
			this._changingValue = {};
			var props = this.props;
			Object.keys(change).forEach(function(prop) {
				props[prop].change(change[prop]);
			});
			this._changing = false;
			this._emit('change', this._changingValue);
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
	});


});