define(['./onDomEventAsync'], function(onDomEventAsync){
	var Focusable = function() {
		this.domNode.tabIndex = 0;
	};
	Focusable.prototype = {
		focus: function() {
			this.domNode.focus();
		},
		blur: function() {
			this.domNode.blur();
		},
		onBlur: onDomEventAsync('blur'),
		onFocus: onDomEventAsync('focus'),
		focused: function() {
			return document.activeElement === this.domNode;
		},
	};
	return Focusable;
});