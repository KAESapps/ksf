define([

], function(

){
	var _Stylable = function() {
		this._style && this.style(this._style);
	};
	_Stylable.prototype = {
		style: function(style) {
			this.hasOwnProperty('_style') && this._style.unapply(this.domNode);
			style.apply(this.domNode);
			this._style = style;
		}
	};

	return _Stylable;
});