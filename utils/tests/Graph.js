define([
	'intern!object',
	'intern/chai!assert',
	'../Graph',
], function(
	registerSuite,
	assert,
	Graph
) {

	var g;

	registerSuite({
		name : "Graph path",
		beforeEach : function() {
			g = window.g = new Graph();
			g.set("init", "undef", "init>undef");
			g.set("undef", "init", "undef>init");
			g.set("init", "simple", "init>simple");
			g.set("simple", "init", "simple>init");
			g.set("simple", "number", "simple>number");
			g.set("number", "simple", "number>simple");
			g.set("simple", "list", "simple>list");
			g.set("list", "simple", "list>simple");
		},
		"path": function(){
			var path = g.getPath("list", "undef");
			assert.deepEqual(path, ["list", "simple", "init", "undef"]);
		},
	});

});