define([
	"doh/runner",
	"../identical",
	"lodash/lodash",
], function(doh, identical, _){

window._ = _;

doh.register("identical tests", {
	"numbers": function(t){
		t.t(identical(10.5, 10.5));
	},
	"strings": function(t){
		t.t(identical("test", "test"));
	},
	"objects": function(t){
		var a = {a:"test", b:"retest"};
		var b = {b:"retest", a:"test"};
		t.t(identical(a, b));
	},
	"nested objects": function(t){
		var a = {a:"test", b:{ba:"test", bb:"retest"}};
		var b = {b:{bb:"retest", ba:"test"}, a:"test"};
		t.t(identical(a, b));
	},
	"arrays of strings order relevant": function(t){
		var a = "toto";
		var b = "titi";
		t.t(identical([a, b], [a, b]));
		t.f(identical([b, a], [a, b]));
	},
	"arrays of strings order irrelevant": function(t){
		var a = "toto";
		var b = "titi";
		t.t(identical([a, b], [a, b], true));
		t.t(identical([b, a], [a, b], true));
	},
	"arrays of simple objects order relevant": function(t){
		var a = {name:"toto", age:30};
		var b = {name:"titi", age:20};
		t.t(identical([a, b], [a, b]));
		t.f(identical([b, a], [a, b]));
	},
	"arrays of simple objects order irrelevant": function(t){
		var a = {name:"toto", age:30};
		var b = {name:"titi", age:20};
		t.t(identical([a, b], [a, b], true));
		t.t(identical([b, a], [a, b], true));
	},
	"arrays of arrays of simple objects order relevant": function(t){
		var a = {name:"toto", age:30};
		var b = {name:"titi", age:20};
		var c = {name:"tata", age:40};
		var d = {name:"tutu", age:10};
		t.t(identical([[a, b], [c, d]],[ [a, b], [c, d]]));
		t.f(identical([[a, b], [c, d]],[ [c, d], [a, b]]));
		t.f(identical([[a, b], [c, d]],[ [b, a], [c, d]]));
	},
	"arrays of arrays of simple objects order irrelevant": function(t){
		var a = {name:"toto", age:30};
		var b = {name:"titi", age:20};
		var c = {name:"tata", age:40};
		var d = {name:"tutu", age:10};
		t.t(identical([[a, b], [c, d]],[ [a, b], [c, d]], true));
		t.t(identical([[a, b], [c, d]],[ [c, d], [a, b]], true));
		t.f(identical([[a, b], [c, d]],[ [b, a], [c, d]], true));
	},

});

});