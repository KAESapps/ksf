define([
	'compose',
	'ksf/dom/composite/Composite',
	'ksf/dom/composite/CompositeMono',
	'ksf/collections/OrderableSet',
	'ksf/collections/Set',
	'./List',
	'./HtmlElement',
	'./HtmlContainer',
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
			this.selection = new Set();

			this._component = new List({
				container: args.container || new HtmlContainer('div'),
				factory: function(item){
					var cmp = args.factory(item);
					// bind selected
					cmp.bindIsIn('selected', self, 'selection', item);
					return cmp;
				}
			});
			this.content = this._component.content;

			args && args.content && this.set('content', args.content);
			args && args.selection && this.set('selection', args.selection);
		}, {
			_contentSetter: function(content) {
				this.content.setContent(content || []);
			},
			_contentGetter: function() {
				return this.content;
			},
			_selectionSetter: function(selection) {
				this.selection.setContent(selection || []);
			},
			_selectionGetter: function() {
				return this.selection;
			}
		}
	);
});
