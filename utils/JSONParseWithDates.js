define([], function() {
	var jsonDateRx = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/;

	return function(json) {
		return json && JSON.parse(json, function(key, value) {
			var match;
			if (typeof value === 'string') {
				match = jsonDateRx.exec(value);
				if (match) {
					return new Date(Date.UTC(
						+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6])
					);
				}
			}
			return value;
		});
	};
});