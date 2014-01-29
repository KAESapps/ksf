define([
	"compose/compose",
	"ksf/collections/ObservableObject",
	"./Destroyable",
	"../utils/destroy",
	"../collections/LazyRegistry"
], function(
	compose,
	ObservableObject,
	Destroyable,
	destroy,
	LazyRegistry

){
	return compose(
		ObservableObject,
		Destroyable,
		function() {
			this._components = new LazyRegistry();
		},
		{
			destroy: function(){
				Destroyable.prototype.destroy.call(this);
				destroy(this._components);
			},
		}
	);
});