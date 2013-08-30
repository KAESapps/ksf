define([
	"dojo/_base/declare",
	"./Input",
	"frb/bind",
], function(declare, Input, bind){

	return declare(Input, {
		domAttrs: {
			type: "number",
		},
		constructor: function(){
			this._cancelValueBinding();//cancel binding inherited from Input
			this._cancelValueBinding = bind(this, "domNode.value", {"<->": "+_presenter.value"});//coerce to number
		},
	});
});