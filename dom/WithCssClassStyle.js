define([
	'compose',
	'collections/set',
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
				newClasses = new Set(),
				domNode = this.get('domNode');

			style && style.forEach(function(value) {
				newClasses.add(value);
			});
			if (this._classes) {
				this._classes.difference(newClasses).forEach(function(cls) {
					domNode.classList.remove(cls);
				});
			}
			newClasses.difference(this._classes || []).forEach(function(cls) {
				domNode.classList.add(cls);
			});
			this._classes = newClasses;
		}
	});
});