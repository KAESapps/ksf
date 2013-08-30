define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'ksf/dom/composite/WithContentMappedToContainer'
], function(
	compose,
	CompositeMono,
	WithContentMappedToContainer
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
			WithContentMappedToContainer.call(this);
		}, {
			destroy: function() {
				CompositeMono.prototype.destroy.call(this);
				WithContentMappedToContainer.prototype.destroy.call(this);
			}
		}
	);
});