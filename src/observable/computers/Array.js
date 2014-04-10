define([
	'compose',
], function(
	compose
){
	var Array = compose(function(item) {
		this._item = item;
	}, {
		computeValue: function(changeArg, initValue) {
			var self = this;
			var value = initValue;
			if (changeArg.change) {
				Object.keys(changeArg.change).forEach(function(index) {
					var changeAtIndex = changeArg.change[index];
					if (changeAtIndex.value) {
						value[index] = changeAtIndex.value;
					} else if (changeAtIndex.change) {
						value[index] = self._item.computeValue(changeAtIndex.change, initValue[index]);
					}
				});
			}
			if (changeArg.remove) {
				Object.keys(changeArg.remove).forEach(function(index) {
					delete value[index];
				});
			}
			if (changeArg.add) {
				Object.keys(changeArg.add).forEach(function(index) {
					value.splice(index, 0, changeArg.add[index]);
				});
			}
			return value;
		},
	});
	return Array;
});