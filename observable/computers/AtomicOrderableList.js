define([
	'../../utils/compose',
], function(
	compose
){
	/**
	Le principe d'un atomic est que sur change, une nouvelle valeur est initialisée sans tenir compte de la valeur précédente
	*/
	var AtomicOrderableList = compose(function(item) {
		this._item = item;
	}, {
		initValue: function(initArg) {
			if (!initArg) {
				return [];
			}
			var item = this._item;
			return initArg.map(function(itemArg) {
				return item.initValue(itemArg);
			});
		},
		computeValue: function(changeArg, initValue) {
			return this.initValue(changeArg);
		},
		computeChangeArg: function(changeArg, initValue) {
			var item = this._item;
			return changeArg.map(function(itemArg) {
				return item.computeChangeArg(itemArg);
			});
		},
	});
	return AtomicOrderableList;
});