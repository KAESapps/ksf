define([
	'compose',
	'bacon',
	'./List'
], function(
	compose,
	Bacon,
	List
){
	return compose(
		List,
		function(){
			this.bind("activeContentElement", this, 'active', {
				convert: function(item){
					var items = this.get('content');
					var itemIndex = items && items.indexOf(item);
					return itemIndex > -1 ? this._component.get('content').get(itemIndex) : undefined;
				},
				revert: function(cmp){
					var cmps = this._component.get('content');
					var index = cmps && cmps.indexOf(cmp);
					return index > -1 ? this.get('content').get(index) : undefined;
				},
			});
			this.bindSelection("activeContentElement", this._component.get("content"), "active");
		}
	);
});