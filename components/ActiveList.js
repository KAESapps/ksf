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
					var items = this.content;
					var itemIndex = items && items.indexOf(item);
					return itemIndex > -1 ? this._component.content.get(itemIndex) : undefined;
				},
				revert: function(cmp){
					var cmps = this._component.content;
					var index = cmps && cmps.indexOf(cmp);
					return index > -1 ? this.content.get(index) : undefined;
				},
			});
			this.bindSelection("activeContentElement", this._component.content, "active");

			// hack for setting 'activeContentElement' when it is created after 'active' is set
			this.content.asReactive().onValue(function(items) {
				var itemIndex = items.indexOf(this.get('active'));
				if (itemIndex > -1){
					var cmp = this._component.content.get(itemIndex);
					if (this.get('activeContentElement') !== cmp){
						this.set('activeContentElement', cmp);
					}
				}
			}.bind(this));


		}
	);
});