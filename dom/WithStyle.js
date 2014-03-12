define([
	'compose',
	'ksf/collections/Set',
	'ksf/collections/ObservableObject'
], function(
	compose,
	Set,
	ObservableObject
){
	return compose(function() {
		this.style = new ObservableObject();
		this._currentStyles = [];
	}, {
		_applyStyle: function() {
			var oldStyles = this._currentStyles,
				newStyles = this.style.toArray(),
				domNode = this.domNode;

			this._currentStyles.forEach(function(styleObj) {
				if (newStyles.indexOf(styleObj) === -1) {
					styleObj.unapply(domNode);
				}
			});
			newStyles.forEach(function(styleObj) {
				if (oldStyles.indexOf(styleObj) === -1) {
					styleObj.apply(domNode);
				}
			});
			this._currentStyles = newStyles;
		}
	});
});