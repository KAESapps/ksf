define([], function() {
	return function(value, cb, scope) {
		scope = scope || null;
		cb.call(scope, value.value());
		return value.onChange(cb.bind(scope));
	};
});