define([
	'compose'
], function(
	compose
){
	return compose({
		_innerSizeGetter: function() {
			var node = this.get('domNode');
			return {
				height: node.clientHeight,
				width: node.clientWidth
			};
		}
	});
});