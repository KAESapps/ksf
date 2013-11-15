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
			this.set('value', args && args.value);

			var selectComponent = this._selectComponent = new HtmlContainerWhichEmitChanged('select');

			this._component = new List({
				container: selectComponent,
				factory: function(item){
					var option = new HtmlElement('option');
					if (args && args.labelProp){
						if (item.getR){
							option.own(option.setR('text', item.getR(args.labelProp)));
						} else {
							option.set('text', item.get ? item.get(args.labelProp) : item[args.labelProp]);
						}
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
					if (self.preventValueUpdateDuringDomInsertionInChrome){
						return self.get('value');
					}
					return self.get('options').get(index);
				},
			});

			// hack for keeping view in sync when options are changed
			this.getR('options').flatMapLatest(function(options) {
				return options.asReactive();
			}).onValue(function() {
				selectComponent.set('selectedIndex', self.get('options').indexOf(self.get('value')));
			});

		}, {
			// allow for updating dom when 'options' are set before dom insertion and 'value' is undefined
			// required for chrome only
			// TODO: triger this only when 'inDom' change to true instead of using 'startLiveRendering' because this component is always live
			startLiveRendering: function() {
				this.preventValueUpdateDuringDomInsertionInChrome = true;
				CompositeMono.prototype.startLiveRendering.apply(this, arguments);
				this._selectComponent.set('selectedIndex', this.get('options').indexOf(this.get('value')));
				delete this.preventValueUpdateDuringDomInsertionInChrome;
			},

			_applyBounds: function() {
				// seems to have the same pb as described above startLiveRendering when changing size
				// deactivate sizing via 'bounds' property for now
			}
		}
	);
});
