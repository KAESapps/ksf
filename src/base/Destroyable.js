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
			this._owned.splice([this._owned.indexOf(o)], 1);
		},
		destroy: function(){
			destroy(this._owned);
			this._destroyed = true;
		},
	};

	return Destroyable;
});