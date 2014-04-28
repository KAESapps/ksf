define([], function() {
	return {
		size: function() {
			var compStyle = getComputedStyle(this.domNode);
			return {
				height: parseFloat(compStyle.getPropertyValue('height')),
				width: parseFloat(compStyle.getPropertyValue('width'))
			};
		}
	};
});