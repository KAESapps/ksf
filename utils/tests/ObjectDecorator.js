define([
	'doh/runner',
	'dojo/_base/declare',	'dojo/Stateful',
	'../ObjectDecorator'
],
function(
	doh,
	declare,				Stateful,
	Decorator
){
    doh.register("Testing object decorator", [
      	{
	        name: "Decorating object",
	        setUp: function() {
	          	this.source = new declare([Stateful], {
	          		sourceCounter: 0,
	          		sourceIncrement: function() {
	          			this.set('sourceCounter', this.get('sourceCounter') + 1);
	          			return this.get('sourceCounter');
	          		}
	          	})();
	          	this.wrap = new Decorator(this.source, {
	          		extraCounter: 0,
	          		extraIncrement: function() {
	          			this.set('extraCounter', this.get('extraCounter') + 1);
	          			return this.get('extraCounter');
	          		}
	          	});
	        },
	        runTest: function() {
	        	doh.t(this.wrap.get('sourceCounter') == 0, "Source property accessible from wrap");
	        	doh.is(this.wrap.sourceIncrement(), 1, "Source method accessible from wrap");
	        	doh.is(this.source.get('sourceCounter'), 1, "Calling source method from wrap affects source");
	        	doh.t(this.wrap.get('extraCounter') == 0, "Extra property added on wrap");
	        	this.wrap.set('extraCounter', 10);
	        	doh.t(this.source.extraCounter === undefined, "Extra property not accessible from source");
	        	doh.t(this.wrap.extraIncrement() == 11, "Extra method works on wrap");
	        	this.wrap.set('sourceCounter', 5);
	        	doh.is(this.source.get('sourceCounter'), 5, "Setting source property from wrap affects source");
	        }
      	}
    ]);
});