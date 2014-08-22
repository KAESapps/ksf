define([], function() {
	return function bindDict (dict, cbs, scope) {
		// loop on current value
		var value = dict.value();
		Object.keys(value).forEach(function(prop) {
			var propValue = value[prop];
			cbs.add.call(scope || null, prop, propValue);
		});
		// react to changes
		return dict.onChange(function(change) {
			Object.keys(change).forEach(function(prop) {
				var propChange = change[prop];
				if ('add' in propChange) {
					cbs.add.call(scope || null, prop, propChange.add);
				}
				if ('remove' in propChange) {
					cbs.remove.call(scope || null, prop);
				}
			});
		});
	};
});