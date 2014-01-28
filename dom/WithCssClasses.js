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
	}, {
		_applyCssClasses: function() {
			var style = this.cssClasses,
				newClasses = new Set(),
				domNode = this.domNode;

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