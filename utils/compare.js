define(function() {
	var compare = function compare(a, b) {
		if (a < b)
			return -1;
		if (a > b)
			return 1;
		// a must be equal to b
		return 0;
	};
	compare.descending = function(a,b) {
		return compare(b, a);
	};
	return compare;

});