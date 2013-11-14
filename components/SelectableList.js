define([
	'compose',
	'ksf/dom/composite/Composite',
	'ksf/dom/composite/CompositeMono',
	'ksf/collections/OrderableSet',
	'ksf/collections/Set',
	'./List',
	'./HtmlElement',
	'./HtmlContainerIncremental',
	'./form/Checkbox',
], function(
	compose,
	Composite,
	CompositeMono,
	OrderableSet,
	Set,
	List,
	HtmlElement,
	HtmlContainer,
	Checkbox
){


	return compose(
		CompositeMono,
		function(args){
			var self = this;
			this.set('content', args && args.content || new OrderableSet());
			this.set('selection', args && args.selection || new Set());

			this._component = new List({
				container: args.container || new HtmlContainer('div'),
				factory: function(item){
					var cmp = args.factory(item);
					// bind selected
					cmp.bindIsIn('selected', self, 'selection', item);
					return cmp;
				},
			});
			this._component.setR('content', this.getR('content'));
		}
	);
});
