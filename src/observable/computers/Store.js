define([
	'compose',
], function(
	compose
){

	var Store = compose(function(item) {
		this._item = item;
	}, {
		computeValue: function(changeArg, initValue) {
			var self = this;
			var value = initValue;
			Object.keys(changeArg).forEach(function(key) {
				var changeAtKey = changeArg[key];
				if (changeAtKey.value) {
					value[key] = changeAtKey.value;
				}
				if (changeAtKey.change) {
					value[key] = self._item.computeValue(changeAtKey.change, initValue[key]);
				}
				if (changeAtKey.remove) {
					delete value[key];
				}
				if (changeAtKey.add) {
					value[key] = changeAtKey.add;
				}
			});
			return value;
		},
	});
	return Store;


});

