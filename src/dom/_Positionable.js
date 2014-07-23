define([], function() {
	return {
		position: function(position) {
			if (position === undefined) {
				// get
				return this._position;
			} else {
				// set
				var nodeStyle = this.domNode.style;
				// reset previous
				for (var p in this._position) {
					nodeStyle[p] = null;
				}
				// set new
				for (p in position) {
					nodeStyle[p] = position[p];
				}
				this._position = position;
			}
		}
	};
});