define([
	'intern!object',
	'intern/chai!assert',
	'../IndexedSet',
], function(
	registerSuite,
	assert,
	IndexedSet
) {
	var reg;
	var values;

	registerSuite({
		name : "Registering without key",
		beforeEach : function() {
			reg = new IndexedSet();
			values = [
				0,
				{},
				"",
			];
			values.forEach(function(v){
				reg.add(v);
			});
		},
		"has": function(){
			values.forEach(function(v){
				assert(reg.has(v));
			});
		},
		"hasKey": function(){
			assert(reg.hasKey(undefined));
			assert(!reg.hasKey(null));
		},
		"getValues": function(){
			assert.deepEqual(reg.getValues(undefined), values);
		},
		"length": function(){
			assert(reg.length === 3);
		},
		"remove": function(){
			values.forEach(function(v){
				reg.remove(v);
				assert(!reg.has(v));
			});
			assert(reg.length === 0);
		},
		"add twice": function(){
			values.forEach(function(v){
				assert.throw(function(){
					reg.add(v);
				}, "A value can not be added twice");
			});
		},
	});
	registerSuite({
		name : "Registering with unique keys",
		beforeEach : function() {
			reg = new IndexedSet();
			values = {
				v0: 0,
				v1: {},
				v2: "",
			};
			Object.keys(values).forEach(function(k){
				reg.add(values[k], k);
			});
		},
		"has": function(){
			Object.keys(values).forEach(function(k){
				assert(reg.has(values[k]));
			});
		},
		"getKey": function(){
			Object.keys(values).forEach(function(k){
				assert(reg.getKey(values[k]) === k);
			});
		},
		"hasKey": function(){
			Object.keys(values).forEach(function(k){
				assert(reg.hasKey(k));
			});
		},
		"getValues": function(){
			Object.keys(values).forEach(function(k){
				assert.deepEqual(reg.getValues(k), [values[k]]);
			});
		},
		"get": function(){
			Object.keys(values).forEach(function(k){
				assert.equal(reg.get(k), values[k]);
			});
		},
		"length": function(){
			assert(reg.length === 3);
		},
		"remove": function(){
			Object.keys(values).forEach(function(k){
				reg.remove(values[k]);
				assert(!reg.has(values[k]));
				assert(!reg.hasKey(k));
			});
			assert(reg.length === 0);
		},
		"removeEach": function(){
			reg.removeEach([values.v0, values.v1]);
			assert(reg.length === 1);
			assert(reg.has(values.v2));
		},
		"removeAll": function(){
			reg.removeAll();
			assert(reg.length === 0);
			Object.keys(values).forEach(function(k){
				assert(!reg.has(values[k]));
				assert(!reg.hasKey(k));
			});
		},
		"forEach": function(){
			var i = 0;
			reg.forEach(function(value, key){
				assert.equal(value, values[Object.keys(values)[i]]);
				assert.equal(key, Object.keys(values)[i]);
				i++;
			});
			assert.equal(i, 3);
		}
	});

	var childParentPairs;

	registerSuite({
		name : "Registering with non unique keys",
		beforeEach : function() {
			reg = new IndexedSet();
			childParentPairs = [
				["1"],
				["11", "1"],
				["12", "1"],
				["13", "1"],
				["121", "12"],
				["122", "12"],
				["1221", "122"],
				["1222", "122"],
				["12221", "1222"],
			];
			childParentPairs.forEach(function(pair){
				reg.add(pair[0], pair[1]);
			});
		},
		"has": function(){
			childParentPairs.forEach(function(pair){
				assert(reg.has(pair[0]));
			});
		},
		"getKey": function(){
			childParentPairs.forEach(function(pair){
				assert(reg.getKey(pair[0]) === pair[1]);
			});
		},
		"getValues": function(){
			assert.deepEqual(reg.getValues(), ["1"]);
			assert.deepEqual(reg.getValues("1"), ["11", "12", "13"]);
			assert.deepEqual(reg.getValues("11"), []);
			assert.deepEqual(reg.getValues("12"), ["121", "122"]);
		},
		"length": function(){
			assert(reg.length === 9);
		},
	});

	var i1, i2, i3;
	registerSuite({
		name : "Events",
		beforeEach : function() {
			reg = new IndexedSet();
			i1 = {};
			i2 = {};
			i3 = {};
		},
		"add one component": function(){
			var event;
			var handler = reg.on("added", function(ev){
				event = ev;
			});
			var event2;
			var handler2 = reg.on("added", function(ev){
				event2 = ev;
			});
			reg.add(i1, "i1");
			assert.equal(event.value, i1);
			assert.equal(event.key, "i1");
			event = null;
			event2 = null;
			handler.remove();
			reg.add(i2, i2);
			assert.equal(event, null);
			assert.equal(event2.value, i2);
			assert.equal(event2.key, i2);
		},
		"add many components": function(){
			var items = [i1, i2, i3];
			var i = 0;
			reg.on("added", function(ev){
				assert.equal(ev.value, items[i]);
				assert.equal(ev.key, i);
				i++;
			});
			reg.addEach(items);
			assert.equal(i, 3);
		},
		"remove one component": function(){
			var items = [i1, i2, i3];
			var i = 0;
			reg.on("removed", function(ev){
				assert.equal(ev.value, i2);
				assert.equal(ev.key, 1);
				i++;
			});
			reg.addEach(items);
			reg.remove(i2);
			assert.equal(i, 1);
		},
		"remove many components": function(){
			var items = [i1, i2, i3];
			var i = 0;
			reg.on("removed", function(ev){
				assert.equal(ev.value, items[i]);
				assert.equal(ev.key, i);
				i++;
			});
			reg.addEach(items);
			reg.removeEach(items);
			assert.equal(i, 3);
		},
	});
});