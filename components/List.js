define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'ksf/utils/destroy',
], function(
	compose,
	CompositeMono,
	destroy
){
	/*
	List is a container wrapper that generates dom components from its 'content' property by using a "factory" and place them in the container. Its 'content' value must be a ks incrementally observable collection.
	This list is optimized for only calling the factory when a new item is added and only doing incremental changes to the dom.
	 */
	return compose(
		CompositeMono,
		function(args){
			this._component = args.container;
			this._factory = args.factory;
			this.set('content', args.content);
			this.own(this._component.get("content").updateContentMapR(this.getChangesStream('content'), this._factory));
		}, {
			destroy: function() {
				CompositeMono.prototype.destroy.call(this);
				// destroy all mapped items
				this._component.get("content").forEach(destroy);
			},
		}
	);
});