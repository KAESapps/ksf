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
		this.cssClasses = new ObservableObject();
		this._currentClasses = [];
	}, {
		_applyCssClasses: function() {
			var oldClasses = this._currentClasses,
				newClasses = this.cssClasses.toArray(),
				domNode = this.domNode;

			this._currentClasses.forEach(function(cssClass) {
				if (newClasses.indexOf(cssClass) === -1) {
					domNode.classList.remove(cssClass);
				}
			});
			newClasses.forEach(function(cssClass) {
				if (oldClasses.indexOf(cssClass) === -1) {
					domNode.classList.add(cssClass);
				}
			});
			this._currentClasses = newClasses;
		}
	});
});