define([

], function(

){
	function value2csv (val) {
		if (typeof val === 'string') {
			return '"' + val + '"';
		}
		if (typeof val === 'number') {
			return val;
		}
		if (typeof val === 'boolean') {
			return val;
		}
		return '';
	}

	function array2csvLine (array) {
		return array.map(value2csv).toString() + '\r\n';
	}

	function convert2csv(array) {
		// header line
		// get columns title from first item
		var keys = Object.keys(array[0]);
		var header = array2csvLine(keys);

		// body
		var body = array.reduce(function(csv, item) {
			var values = keys.map(function(key) {
				return item[key];
			});
			return csv += array2csvLine(values);
		}, '');
		return header + body;
	}

	return convert2csv;

});