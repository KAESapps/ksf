define([

], function(

){
	var _Stylable = function() {
		this._style && this.style(this._style);
	};
	_Stylable.prototype = {
		style: function(style) {
			style.apply(this.domNode);
		}
	};

	return _Stylable;
});