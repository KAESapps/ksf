define([
	"dojo/_base/declare",
	"../../component/DomComponent",
	"frb/bind",
	"../../utils/frb-dom",
], function(declare, DomComponent, bind){

	return declare(DomComponent, {
		domTag: "input",
		constructor: function(){
			this._cancelValueBinding = bind(this, "domNode.value", {"<->": "_presenter.value"});
		},
		destroy: function(){
			this._cancelValueBinding();
			this.inherited(arguments);
		},
	});
});