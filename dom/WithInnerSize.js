define([
	'compose'
], function(
	compose
){
	return compose({
		_innerSizeGetter: function() {
			var node = this.get('domNode'),
				compStyle = getComputedStyle(node);
			return {
				height: parseFloat(compStyle.getPropertyValue('height')),
				width: parseFloat(compStyle.getPropertyValue('width'))
			};
		}
	});
});