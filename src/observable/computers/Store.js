define([
	'compose',
], function(
	compose
){

	var Store = compose(function(item) {
		this._item = item;
	}, {
		initValue: function(initArg) {
			var value = {};
			if (! initArg) {
				return {};
			}
			var item = this._item;
			Object.keys(initArg).forEach(function(key) {
				value[key] = item.initValue(initArg[key]);
			});
			return value;
		},
		computeValue: function(changeArg, initValue) {
			var item = this._item;
			var value = initValue;
			Object.keys(changeArg).forEach(function(key) {
				var changeAtKey = changeArg[key];
				if (changeAtKey.change) {
					value[key] = item.computeValue(changeAtKey.change, initValue[key]);
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
		computeChangeArg: function(changeArg, initValue) {
			// TODO: vérifier que les clés à ajouter n'existent pas déjà, que celles à enlever existent bien ainsi que celles à changer
			var item = this._item;
			// replace undefined key by a generated key
			for (var key in changeArg) {
				var changeAtKey = changeArg[key];
				// generate values for add
				if ('add' in changeAtKey) {
					changeAtKey.add = item.initValue(changeAtKey.add);
					if (key === 'undefined') {
						key = Math.random();
						changeArg[key] = changeArg['undefined'];
						delete changeArg['undefined'];
					}
				}
				if (changeAtKey.change) {
					if (item.computeChangeArg) {
						changeAtKey.change = item.computeChangeArg(changeAtKey.change, initValue[key]);
					}
				}
			}
			return changeArg;
		},

	});
	return Store;



});

