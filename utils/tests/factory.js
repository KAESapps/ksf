define([
	'doh/runner',
	'dojo/_base/declare',
	'../factory'
], function(
	doh,
	declare,
	factory
) {
	"use strict";
	
	doh.register("Testing factory", [{
		name : "factory",
		setUp : function() {
			this.date = new Date();
			this.now = factory.new_(Date)();
			this.newYear = factory.new_(Date, 2013, 0, 1)();
			
			this.customClass = declare([], {
				constructor: function(start) {
					this.count = start;
				},
				
				increment: function() {
					this.count += 1;
				}
			});
			
			this.classInstance = factory.new_(this.customClass, 5)();
			
			this.createFn = function(arg) {
				return arg;
			};
			this.resultObj = factory(this.createFn, "test")();
		},
		runTest : function() {
			doh.t(this.now instanceof Date, "Date instance with no args");
			doh.t(this.newYear instanceof Date, "Date instance with args");
			doh.is(this.newYear.getFullYear(), 2013, "Date instance, correct year");
			doh.is(this.newYear.getMonth(), 0, "Date instance, correct month");
			doh.is(this.newYear.getDate(), 1, "Date instance, correct day");
			
			doh.t(this.classInstance instanceof this.customClass, "Custom instance");
			doh.is(this.classInstance.count, 5, "Initialisation of custom instance successful");
			this.classInstance.increment();
			doh.is(this.classInstance.count, 6, "Method call on custom instance successful");
			
			doh.is(this.resultObj, "test", "Creation function successful");
		}
	}]);
}); 