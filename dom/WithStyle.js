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
	}, {
		_applyStyle: function() {
			var style = this.style,
				newStyles = new Set(),
				domNode = this.domNode;

			style && style.forEach(function(styleObj) {
				newStyles.add(styleObj);
			});
			if (this._appliedStyles) {
				this._appliedStyles.difference(newStyles).forEach(function(styleObj) {
					styleObj.unapply(domNode);
				});
			}
			newStyles.difference(this._appliedStyles || []).forEach(function(styleObj) {
				styleObj.apply(domNode);
			});
			this._appliedStyles = newStyles;
		}
	});
});