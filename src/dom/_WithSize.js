define([], function() {
	return {
		size: function() {
			return {
				height: this.domNode.offsetHeight,
				width: this.domNode.offsetWidth
			};
		}
	};
});