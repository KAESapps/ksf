define([
	'../../utils/compose',
], function(
	compose
){
	// attention, non fonctionnel, il faudrait trier les clés pour les add et les remove, savoir quand il faut faire les move, ... pas simple
	var Array = compose(function(item) {
		this._item = item;
	}, {
		initValue: function(initArg) {
			var item = this._item;
			return initArg.map(function(itemInitArg) {
				return item.initValue(itemInitArg);
			});
		},
		computeValue: function(changeArg, initValue) {
			var item = this._item;
			var value = initValue;
			if (changeArg.change) {
				Object.keys(changeArg.change).forEach(function(index) {
					value[index] = item.computeValue(changeArg.change[index], initValue[index]);
				});
			}
			if (changeArg.remove) {
				Object.keys(changeArg.remove).forEach(function(index) {
					delete value[index];
				});
			}
			if (changeArg.add) {
				Object.keys(changeArg.add).forEach(function(index) {
					value.splice(index, 0, item.initValue(changeArg.add[index]));
				});
			}
			if (changeArg.move) {}
			return value;
		},
	});
	return Array;
});