define([

], function(

){
	function value2csv (val, locale) {
		if (typeof val === 'string') {
			return '"' + val + '"';
		}
		if (typeof val === 'number') {
			return '"' + val.toLocaleString(locale) + '"';
		}
		if (typeof val === 'boolean') {
			return val ? 1 : 0;
		}
		if (val instanceof Date) {
			return '"' + val.toLocaleString(locale) + '"';
		}
		return '';
	}

	function array2csvLine (array, locale) {
		return array.map(function(val) { return value2csv(val, locale); }).toString() + '\r\n';
	}

	/**
	Convert an array of items (objects with same shape) to a CSV string
	Column titles of header line are picked from first item if no columnsConfig is provided
	*/
	function convert2csv(array, columnsConfig, locale) {
		locale = locale || 'fr';
		if (!columnsConfig) {
			columnsConfig = Object.keys(array[0]);
		}
		var columns = columnsConfig.map(function(col) {
			if (typeof(col) === 'string') {
				return {
					id: col,
					label: col
				};
			} else {
				return col;
			}
		});
		
		// header line
		var header = array2csvLine(columns.map(function(col) {
			return col.label;
		}));

		// body
		var body = array.reduce(function(csv, item) {
			var values = columns.map(function(col) {
				return item[col.id];
			});
			return csv += array2csvLine(values, locale);
		}, '');
		return header + body;
	}

	return convert2csv;

});