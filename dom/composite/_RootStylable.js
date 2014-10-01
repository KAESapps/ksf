define([], function(){
	return {
		style: function(style) {
			this._root.style(style);
			return this;
		}
	};
});