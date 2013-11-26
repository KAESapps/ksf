define([
	'compose',
	'ksf/dom/composite/Composite',
	'ksf/dom/composite/CompositeMono',
	'ksf/collections/OrderableSet',
	'ksf/collections/Set',
	'./SelectableList',
	'./HtmlElement',
	'./HtmlContainer',
	'./form/Checkbox',
], function(
	compose,
	Composite,
	CompositeMono,
	OrderableSet,
	Set,
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
				selector: new Checkbox(),
				labelViewer: new HtmlElement('span'),
			});
			this._root = new HtmlContainer('label');
			this._layout.set('config',[
				'selector',
				'labelViewer',
			]);

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
			this.options = this._component.content;
			this.selection = this._component.selection;

			args && args.options && this.set('options', args.options);
			args && args.selection && this.set('selection', args.selection);
		}, {
			_optionsSetter: function(options) {
				this.options.setContent(options || []);
			},
			_optionsGetter: function() {
				return this.options;
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
