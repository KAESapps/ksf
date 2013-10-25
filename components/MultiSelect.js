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

	var SelectableLabel = compose(
		Composite,
		function(args) {
			this.content = args && args.content;
			this._components.setEach({
				container: new HtmlContainer('div'),
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
				this._components.get('labelViewer').setR('textContent', this.getR('content')),
				this._components.get('selector').bind('value', this, 'selected')
			);
		}, {
			bindIsIn: function(targetProp, source, sourceProp, item) {
				var init = true;
				var target = this;
				var sourceValueR = source.getR(sourceProp).flatMapLatest(function(collection) {
					return collection.asChangesStream();
				});
				var targetValueR = target.getR(targetProp);
				// init target prop value
				target.set(targetProp, source.get(sourceProp).has(item));

				// start observing source collection changes
				var changing = false;
				var sourceHandler = sourceValueR.onValue(function(changes){
					if (! changing && ! init){
						changing = true;
						changes.forEach(function(change) {
							if (change.value === item){
								if (change.type === 'add'){
									if (target.get(targetProp) !== true) {target.set(targetProp, true);}
								} else if (change.type === 'remove') {
									if (target.get(targetProp) !== false) {target.set(targetProp, false);}
								}
							}
						});
						changing = false;
					}
				});
				// start observing target prop changes
				var targetHandler = targetValueR.onValue(function(isIn){
					if (! changing && ! init){ // prevent calling source.set at init time
						changing = true;
						var collection = source.get(sourceProp);
						if (isIn) {
							if (!collection.has(item)){
								collection.add(item);
							}
						} else {
							if (collection.has(item)){
								collection.remove(item);
							}
						}
						changing = false;
					}
				});
				init = false;
				return this.own(function(){
					targetHandler();
					sourceHandler();
				});
			},
		}
	);

	return compose(
		CompositeMono,
		function(args){
			var self = this;
			this.set('options', args && args.options || new OrderableSet());
			this.set('selection', args && args.selection || new Set());

			var selectComponent = this._selectComponent = new HtmlContainer('div');

			this._component = new List({
				container: selectComponent,
				factory: function(item){
					var selectable = new SelectableLabel();
					// bind content
					if (args && args.labelProp){
						if (item.getR){
							selectable.own(selectable.setR('content', item.getR(args.labelProp)));
						} else {
							selectable.set('content', item.get ? item.get(args.labelProp) : item[args.labelProp]);
						}
					} else {
						selectable.set('content', item);
					}
					// bind selected
					selectable.bindIsIn('selected', self, 'selection', item);
					return selectable;
				},
			});
			this._component.setR('content', this.getR('options'));
		}
	);
});
