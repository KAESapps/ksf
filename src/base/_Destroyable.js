define([
	'../utils/destroy',
], function(
	destroy
){
	var _Destroyable = function(){
		this._owned = {};
		this._ownedAnonymous = [];
	};
	_Destroyable.prototype = {
		_own: function(o, key){
			if (key) {
				this._destroy(key);
				this._owned[key] = o;
			} else {
				this._ownedAnonymous.push(o);
			}
			return o;
		},
		_unown: function(key){
			delete this._owned[key];
		},
		_destroy: function(key) {
			var o = this._owned[key];
			this._unown(key);
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

	return _Destroyable;
});