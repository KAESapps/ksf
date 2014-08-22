define([], function() {
	return function bindOrderedDict (dict, cbs, scope) {
		scope = scope || null;
		// loop on current value
		var value = dict.value();
		value.forEach(function(key) {
			cbs.add.call(scope, key);
		});
		// react to changes
		return dict.onChange(function(changes) {
			changes.forEach(function(change) {
				if (change.type === 'add') {
					cbs.add.call(scope, change.key, change.beforeKey);
				}
				if (change.type === 'remove') {
					cbs.remove.call(scope, change.key);
				}
			});
		});
	};
});