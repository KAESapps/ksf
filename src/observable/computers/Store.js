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
			if (changeArg.change) {
				Object.keys(changeArg.change).forEach(function(key) {
					var changeAtKey = changeArg.change[key];
					if (changeAtKey.value) {
						value[key] = changeAtKey.value;
					} else if (changeAtKey.change) {
						value[key] = self._item.computeValue(changeAtKey.change, initValue[key]);
					}
				});
			}
			if (changeArg.remove) {
				Object.keys(changeArg.remove).forEach(function(key) {
					delete value[key];
				});
			}
			if (changeArg.add) {
				Object.keys(changeArg.add).forEach(function(key) {
					value[key] = changeArg.add[key];
				});
			}
			return value;
		},
	});
	return Store;


});

