define(['./nativeCompare'], function(nativeCompare) {
	// find the index to insert 'value' in 'array' in order to keep 'array' sorted according to 'compare'
	return function sortedIndex(array, value, compare) {
		compare = compare || nativeCompare;
		var low = 0,
		high = array ? array.length : low;

		while (low < high) {
			var mid = (low + high) >>> 1;
			(compare(value, array[mid]) > 0)	?
				low = mid + 1 :
				high = mid;
		}
		return low;
	};
});