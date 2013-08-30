define([
	'ksf/utils/destroy',
], function(
	destroy
){
	var Destroyable = function(){
		this._owned = [];
	};
	Destroyable.prototype = {
		own: function(o){
			this._owned.push(o);
			return o;
		},
		unown: function(o){
			this._owned.delete(o);
		},
		destroy: function(){
			this._owned.forEach(destroy);
		},
	};

	return Destroyable;
});