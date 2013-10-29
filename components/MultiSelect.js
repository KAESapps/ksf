define([
	'compose',
	'ksf/dom/composite/Composite',
	'ksf/dom/composite/CompositeMono',
	'ksf/collections/OrderableSet',
	'./SelectableList',
	'./HtmlElement',
	'./HtmlContainerIncremental',
	'./form/Checkbox',
], function(
	compose,
	Composite,
	CompositeMono,
	OrderableSet,
	SelectableList,
	HtmlElement,
	HtmlContainer,
	Checkbox
){
	var SelectableLabel = compose(
		Composite,
		function(args) {
			this.set('label', args && args.label);
			this._components.setEach({
				container: new HtmlContainer('label'),
				selector: new Checkbox(),
				labelViewer: new HtmlElement('span'),
			});
			this._layout.set('config',
				['container', [
					'selector',
					'labelViewer',
				]]
			);

			this.own(
				this._components.get('labelViewer').setR('textContent', this.getR('label')),
				this._components.get('selector').bind('value', this, 'selected')
			);
		}, {
		}
	);

	return compose(
		CompositeMono,
		function(args){
			var self = this;
			this.set('options', args && args.options || new OrderableSet());
			this.set('selection', args && args.selection || new Set());

			this._component = new SelectableList({
				container: new HtmlContainer('div'),
				factory: function(item){
					var selectable = new SelectableLabel();
					if (args && args.labelProp){
						if (item.getR){
							selectable.own(selectable.setR('label', item.getR(args.labelProp)));
						} else {
							selectable.set('label', item.get ? item.get(args.labelProp) : item[args.labelProp]);
						}
					} else {
						selectable.set('label', item);
					}
					return selectable;
				},
			});
			this._component.setR('content', this.getR('options'));
			this._component.setR('selection', this.getR('selection'));

		}
	);
});
