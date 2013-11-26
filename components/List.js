define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'ksf/collections/OrderableSet',
	'ksf/utils/destroy',
], function(
	compose,
	CompositeMono,
	OrderableSet,
	destroy
){
	/*
	List is a container wrapper that generates dom components from its 'content' property by using a "factory" and place them in the container. Its 'content' value must be a ks incrementally observable collection.
	This list is optimized for only calling the factory when a new item is added and only doing incremental changes to the dom.
	 */
	return compose(
		CompositeMono,
		function(args){
			this.content = new OrderableSet();

			this._component = args.container;
			this._factory = args.factory;
			args.content && this.set('content', args.content);

			this.own(this._component.content.updateContentMapR(this.content.asChangesStream(), this._factory));
		}, {
			destroy: function() {
				CompositeMono.prototype.destroy.call(this);
				// destroy all mapped items
				this._component.content.forEach(destroy);
			},
			_contentSetter: function(content) {
				this.content.setContent(content || []);
			},
			_contentGetter: function() {
				return this.content;
			}
		}
	);
});