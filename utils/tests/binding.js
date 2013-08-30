define([
	'intern!object',
	'intern/chai!assert',
	'../binding',
], function(
	registerSuite,
	assert,
	binding
) {

	registerSuite({
		name : "reactiveMapping",
		"basic": function(){
			function assertSynced(){
				source.forEach(function(value, index){
					assert(target.values[index] === value+"bis");
				});
			}

			var source = ["a", "b", "c"];
			var target = window.target = {
				values: [],
				add: function(value, index){
					this.values.splice(index, 0, value+"bis");
				},
				remove: function(value, index){
					var mappedValue = this.values.splice(index, 1);
					assert(mappedValue[0] === value+"bis");
				},
			};
			var handler = new binding.ReactiveMapping(source, target);
			assertSynced();
			source.push("d");
			assertSynced();
			source.pop();
			assertSynced();
			source.splice(1, 2, "f", "g");
			assertSynced();
			source.clear();
			assertSynced();
			handler.remove();
			source.push("e");
			assert(source.length === target.values.length + 1);
		},
		"source property path": function(){
			function assertSynced(){
				source.collectionWrapper.collection.forEach(function(value, index){
					assert(target.values[index] === value+"bis");
				});
			}

			var source = {
				collectionWrapper: {
					collection : ["a", "b", "c"]
				}
			};
			var target = window.target = {
				values: [],
				add: function(value, index){
					this.values.splice(index, 0, value+"bis");
				},
				remove: function(value, index){
					this.values.splice(index, 1);
				},
			};
			var handler = new binding.ReactiveMapping(source, target, {
				sourceProp: "collectionWrapper.collection",
			});
			assertSynced();
			source.collectionWrapper = {
				collection: ["un"],
			};
			assertSynced();
			source.collectionWrapper.collection = [];
			assert.equal(target.values.length, 0);
		},
		"other method names": function(){
			function assertSynced(){
				source.forEach(function(value, index){
					assert(target.values[index] === value+"bis");
				});
			}

			var source = ["a", "b", "c"];
			var target = window.target = {
				values: [],
				addValue: function(value, index){
					this.values.splice(index, 0, value+"bis");
				},
				removeValue: function(value, index){
					this.values.splice(index, 1);
				},
			};
			var handler = new binding.ReactiveMapping(source, target, {
				addMethod: "addValue",
				removeMethod: "removeValue",
			});
			assertSynced();
			source.push("d");
			assertSynced();
			source.pop();
			assertSynced();
		},
		"row argument": function(){
			function assertSynced(){
				source.forEach(function(value, index){
					var mappedValue = target.mapped[index];
					assert(mappedValue.value === value);
					assert(mappedValue.index === index);
				});
			}

			var source = ["a", "b", "c"];
			var target = window.target = {
				mapped: [],
				add: function(value, index, row){
					this.mapped.splice(index, 0, row);
				},
				remove: function(value, index, row){
					this.mapped.splice(index, 1);
				},
			};
			var handler = new binding.ReactiveMapping(source, target);
			assertSynced();
			source.push("d");
			assertSynced();
			source.pop();
			assertSynced();
			source.splice(1, 2, "f", "g");
			assertSynced();
			source.clear();
			assertSynced();
			handler.remove();
			source.push("e");
			assert(source.length === target.mapped.length + 1);
		}

	});

	registerSuite({
		name : "selection binding",
		"basic": function(){
			var collection = ["a", "b", "c"];
			var selection = ["b"];
			var canceler = binding.Selection(collection, selection);

			// initial values are not changed
			assert.deepEqual(collection.slice(), ["a", "b", "c"]);
			assert.deepEqual(selection.slice(), ["b"]);

			// can add value to selection
			selection.add("a");
			assert.deepEqual(selection.slice(), ["b","a"]);

			// can remove value from selection
			selection.delete("b");
			assert.deepEqual(selection.slice(), ["a"]);

			// cannot add an unknown value to selection
			selection.add("d");
			assert.deepEqual(selection.slice(), ["a"]);

			// can add value to collection
			collection.add("d");
			assert.deepEqual(collection.slice(), ["a", "b", "c", "d"]);

			// can remove value from collection
			// selection is updated
			collection.delete("a");
			assert.deepEqual(collection.slice(), ["b", "c", "d"]);
			assert.deepEqual(selection.slice(), []);

			canceler.remove();
			// selection is no more updated
			selection.add("b");
			collection.delete("b");
			assert.deepEqual(collection.slice(), ["c", "d"]);
			assert.deepEqual(selection.slice(), ["b"]);
		},
		"with property paths": function(){
			var cmp = {
				collection: ["a", "b", "c"],
				selection: ["b"],
			};
			var canceler = binding.Selection(cmp, cmp, {
				sourceProp: "collection",
				targetProp: "selection",
			});

			var collection = cmp.collection;
			var selection = cmp.selection;

			// initial values are not changed
			assert.deepEqual(collection.slice(), ["a", "b", "c"]);
			assert.deepEqual(selection.slice(), ["b"]);

			// can add value to selection
			selection.add("a");
			assert.deepEqual(selection.slice(), ["b","a"]);

			// can remove value from selection
			selection.delete("b");
			assert.deepEqual(selection.slice(), ["a"]);

			// cannot add an unknown value to selection
			selection.add("d");
			assert.deepEqual(selection.slice(), ["a"]);

			// can add value to collection
			collection.add("d");
			assert.deepEqual(collection.slice(), ["a", "b", "c", "d"]);

			// can remove value from collection
			// selection is updated
			collection.delete("a");
			assert.deepEqual(collection.slice(), ["b", "c", "d"]);
			assert.deepEqual(selection.slice(), []);
		},
		"change collection": function(){
			var cmp = {
				collection: ["a", "b", "c"],
				selection: ["b"],
			};
			var canceler = binding.Selection(cmp, cmp, {
				sourceProp: "collection",
				targetProp: "selection",
			});

			// change collection
			// selection is cleared even if the values are also in the new collection
			cmp.collection = ["b", "d"];
			assert.deepEqual(cmp.collection.slice(), ["b", "d"]);
			assert.deepEqual(cmp.selection.slice(), []);

			// can add value to selection
			cmp.selection.add("b");
			assert.deepEqual(cmp.selection.slice(), ["b"]);
			// cannot add an unknown value to selection
			cmp.selection.add("a");
			assert.deepEqual(cmp.selection.slice(), ["b"]);
			// when removing value from collection, selection is updated
			cmp.collection.delete("b");
			assert.deepEqual(cmp.collection.slice(), ["d"]);
			assert.deepEqual(cmp.selection.slice(), []);
		},
		"change selection": function(){
			var cmp = {
				collection: ["a", "b", "c"],
				selection: ["b"],
			};
			var canceler = binding.Selection(cmp, cmp, {
				sourceProp: "collection",
				targetProp: "selection",
			});

			// change selection
			// unknow values are not added
			cmp.selection = ["b", "d"];
			assert.deepEqual(cmp.collection.slice(), ["a", "b", "c"]);
			assert.deepEqual(cmp.selection.slice(), ["b"]);

			// can add value to selection
			cmp.selection.add("a");
			assert.deepEqual(cmp.selection.slice(), ["b", "a"]);
			// cannot add an unknown value to selection
			cmp.selection.add("d");
			assert.deepEqual(cmp.selection.slice(), ["b", "a"]);
			// when removing value from collection, selection is updated
			cmp.collection.delete("b");
			assert.deepEqual(cmp.collection.slice(), ["a", "c"]);
			assert.deepEqual(cmp.selection.slice(), ["a"]);
		}
	});
});