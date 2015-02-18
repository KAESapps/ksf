define([

], function(

) {
	return function(orderedBranch, cbs) {
		var storage = {}; // permet aux cbs de renvoyer une valeur pour la stocker
		var add = cbs.add && function(ev) {
			var ret = cbs.add(ev.key, ev.beforeKey);
			storage[ev.key] = ret;
		};
		var remove = cbs.remove && function(ev) {
			var key = ev.key;
			cbs.remove(key, storage[key]);
			delete storage[key];
		};

		if (cbs.init) {
			// permet d'avoir une logique d'initialisation différente de la logique incrémentale
			// je ne sais pas si c'est très utile...
			cbs.init(orderedBranch.keys());
		} else {
			add && orderedBranch.keys().forEach(add);
		}
		var keyAddedHandler = add && orderedBranch.onKeyAdded(add);
		var keyRemovedHandler = remove && orderedBranch.onKeyRemoved(remove);

		return function() {
			keyAddedHandler && keyAddedHandler();
			keyRemovedHandler && keyRemovedHandler();
		};
	};

});