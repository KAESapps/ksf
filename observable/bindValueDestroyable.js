var destroy = require('../utils/destroy');

module.exports = function(value, cb, scope) {
	scope = scope || null;
	var toBeDestroyed = cb.call(scope, value.value());
	var canceler = value.onChange(function(val) {
		destroy(toBeDestroyed);
		toBeDestroyed = cb.call(scope, val);
	});
	return function() {
		canceler();
		destroy(toBeDestroyed);
	};
};
