define([

], function(

) {
	return function(tree, cbs) {
		var storage = {}; // permet aux cbs de renvoyer une valeur pour la stocker
		var add = function(key) {
			var ret = cbs.add(key);
			storage[key] = ret;
		};
		var remove = function(key) {
			cbs.remove(key, storage[key]);
			delete storage[key];
		};

		if (cbs.init) {
			// permet d'avoir une logique d'initialisation différente de la logique incrémentale
			// je ne sais pas si c'est très utile...
			cbs.init(Object.keys(tree.keys()));
		} else {
			Object.keys(tree.keys()).forEach(add);
		}
		var keyAddedHandler = tree.onKeyAdded(add);
		var keyRemovedHandler = tree.onKeyRemoved(remove);

		return function() {
			keyAddedHandler();
			keyRemovedHandler();
		};
	};

});