define([
	'../utils/compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
) {
	// permet d'assembler des observables comme s'ils étaient des propriétés d'un dict.
	//  On peut alors observer le dict pour être averti des changements des sources et même changer le dict en transactionnel (si on change plusieurs propriétés d'un coup, il n'y aura qu'un seul changement émis par le dict)
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