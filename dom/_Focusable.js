define(['./onDomEventAsyncMethod'], function(onDomEventAsyncMethod){
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
		onBlur: onDomEventAsyncMethod('blur'),
		onFocus: onDomEventAsyncMethod('focus'),
		focused: function() {
			return document.activeElement === this.domNode;
		},
	};
	return Focusable;
});