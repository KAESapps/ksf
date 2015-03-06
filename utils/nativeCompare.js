define([], function() {
	return function (a, b) {
		return a === b ? 0 : (a < b ? -1 : 1);
	};
});