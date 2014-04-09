define([
], function(
){
	return {
		computeChangesFromPatch: function(patchArg, initValue) {
			return patchArg;
		},
		computeValueFromChanges: function(patchArg, value) {
			var self = this;
			patchArg = patchArg || {};
			value = value || {}; // on ne fait pas de clone, c'est à l'utilisateur de le faire si besoin

			if (patchArg.remove) {
				Object.keys(patchArg.remove).forEach(function(key) {
					delete value[key];
				});
			}
			if (patchArg.set) {
				Object.keys(patchArg.set).forEach(function(key) {
					value[key] = patchArg.set[key];
				});
			}
			if (patchArg.patch) {
				Object.keys(patchArg.patch).forEach(function(key) {
					value[key] = self.computeValueFromChanges(patchArg.patch[key], value[key]);
				});
			}
			if (patchArg.add) {
				Object.keys(patchArg.add).forEach(function(key) {
					value[key] = patchArg.add[key];
				});
			}

			return value;
		},
	};
});