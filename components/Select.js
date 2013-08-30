define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'ksf/base/Destroyable',
	'ksf/utils/destroy',
	'ksf/dom/proxyEvent',
	'ksf/collections/OrderableSet',
	'./List',
	'./HtmlElement',
	'./HtmlContainerIncremental',
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
		HtmlContainer,
		proxyEvent.changed
	);

	/**
	Component that uses native <select> html element for displaying a list of items as text and selecting one item
	Known bug: in chrome, the native <select> element automatically select the first item when inserted in dom without emiting a 'change' event. So we have to ensure to insert this Select component in dom before to set the 'options'
	*/
	return compose(
		CompositeMono,
		function(args){
			var self = this;
			this.set('options', args && args.options || new OrderableSet());

			var selectComponent = new HtmlContainerWhichEmitChanged('select');

			this._component = new List({
				container: selectComponent,
				factory: function(item){
					var option = new HtmlElement('option');
					if (args && args.labelProp){
						option.own(option.setR('text', item.getR(args.labelProp)));
					} else {
						option.set('text', item);
					}
					return option;
				},
			});
			this._component.setR('content', this.getR('options'));
			selectComponent.bind('selectedIndex', this, 'value', {
				convert: function(item){
					return self.get('options').indexOf(item);
				},
				revert: function(index){
					return self.get('options').get(index);
				},
			});

			// hack for keeping view in sync when options are changed
			this.getR('options').flatMapLatest(function(options) {
				return options.asReactive();
			}).onValue(function() {
				selectComponent.set('selectedIndex', self.get('options').indexOf(self.get('value')));
			});

		}
	);
});