define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'ksf/base/Destroyable',
	'ksf/utils/destroy',
	'ksf/dom/proxyEvent',
	'ksf/collections/OrderableSet',
	'./List',
	'./HtmlElement',
	'./HtmlContainer',
], function(
	compose,
	CompositeMono,
	Destroyable,
	destroy,
	proxyEvent,
	OrderableSet,
	List,
	HtmlElement,
	HtmlContainer
){

	var HtmlContainerWhichEmitChanged = compose(
		HtmlContainer, function() {
			var domNode = this.domNode;
			var valueChange = function(ev) {
				this.domAttrs.setEach({
					value: domNode.value,
					selectedIndex: domNode.selectedIndex
				});
			}.bind(this);
			domNode.addEventListener('change', valueChange);
			this.own(function() {
				domNode.removeEventListener('change', valueChange);
			});
		}
	);

	/**
	Component that uses native <select> html element for displaying a list of items as text and selecting one item
	Known bug: in chrome, the native <select> element automatically select the first item when inserted in dom without emiting a 'change' event. So we have to ensure to insert this Select component in dom before to set the 'options'
	*/
	return compose(
		CompositeMono,
		function(args){
			var self = this;

			var selectComponent = this._selectComponent = new HtmlContainerWhichEmitChanged('select');
			this._component = new List({
				container: selectComponent,
				factory: function(item){
					var option = new HtmlElement('option');
					if (args && args.labelProp){
						if (item.getR){
							option.own(option.domAttrs.setR('text', item.getR(args.labelProp)));
						} else {
							option.domAttrs.set('text', item.get ? item.get(args.labelProp) : item[args.labelProp]);
						}
					} else {
						option.domAttrs.set('text', item);
					}
					return option;
				},
			});

			this.options = this._component.content;
			args && args.options && this.set('options', args.options);
			this.set('value', args && args.value);

			selectComponent.domAttrs.bind('selectedIndex', this, 'value', {
				convert: function(item){
					return self.options.indexOf(item);
				},
				revert: function(index){
					if (self.preventValueUpdateDuringDomInsertionInChrome){
						return self.get('value');
					}
					return self.options.get(index);
				},
			});

			// hack for keeping view in sync when options are changed
			this.options.asReactive().onValue(function() {
				selectComponent.domAttrs.set('selectedIndex', self.options.indexOf(self.get('value')));
			});

			this.getR('inDom').onValue(function(inDom) {
				if (inDom) {
					self.preventValueUpdateDuringDomInsertionInChrome = true;
					self._selectComponent.domAttrs.set('selectedIndex', self.options.indexOf(self.get('value')));
					delete self.preventValueUpdateDuringDomInsertionInChrome;
				}
			});
		}, {
			_optionsSetter: function(options) {
				this.options.setContent(options);
			},
			_optionsGetter: function() {
				return this.options;
			}
		}
	);
});
