define([

], function(

){
	var WithFocused = function() {
		// react to "this.set('focused')"
		this.getR('focused').onValue(function(focused) {
			if (!this._changingFocus) {
				this._changingFocus = true;
				if (focused) {
					this.get('domNode').focus();
				} else {
					this.get('domNode').blur();
				}
				this._changingFocus = false;
			}
		}.bind(this));

		// react to domNode "focus" and "blur" events
		var onfocus = function(e) {
			if (!this._changingFocus) {
				this._changingFocus = true;
				this.set('focused', true);
				this._changingFocus = false;
			}
		}.bind(this);
		this.get('domNode').addEventListener('focus', onfocus);
		this.own(function() {
			this.get('domNode').removeEventListener('focus', onfocus);
		}.bind(this));
		var onblur = function(e) {
			if (!this._changingFocus) {
				this._changingFocus = true;
				this.set('focused', false);
				this._changingFocus = false;
			}
		}.bind(this);
		this.get('domNode').addEventListener('blur', onblur);
		this.own(function() {
			this.get('domNode').removeEventListener('blur', onblur);
		}.bind(this));
	};
	WithFocused.prototype = {
		_focused: false,
		_focusedSetter: function(b) {
			this._focused = !!b;
		},
		_focusedGetter: function() {
			return this._focused;
		},
	};
	return WithFocused;
});