define([
	'../utils/destroy',
], function(
	destroy
){
	var Registry = function(){
		this._owned = {};
		this._ownedAnonymous = [];
	};
	Registry.prototype = {
		own: function(o, key){
			if (key) {
				this.destroyOwned(key);
				this._owned[key] = o;
			} else {
				this._ownedAnonymous.push(o);
			}
			return o;
		},
		unown: function(key){
			delete this._owned[key];
		},
		destroyOwned: function(key) {
			var o = this._owned[key];
			this.unown(key);
			destroy(o);
		},
		destroy: function(){
			destroy(this._ownedAnonymous);
			for (var key in this._owned) {
				destroy(this._owned[key]);
			}
			this._destroyed = true;
		},
	};

	return Registry;
});