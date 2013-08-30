define([
	'intern!object',
	'intern/chai!assert',
	'../ObservableObject',
	'../OrderableSet',
], function(
	registerSuite,
	assert,
	ObservableObject,
	OrderableSet
){
	var collection;
	var cbCalledCount, cb2CalledCount;
	var cancelerCalledCount, canceler2CalledCount;
	var cmp1, cmp2, cmp3;
	var cbArgs, cb2Args;

	registerSuite({
		name: "whenDefined",
		beforeEach: function(){
			collection = new ObservableObject();
			cbCalledCount = cb2CalledCount = 0;
			cancelerCalledCount = canceler2CalledCount = 0;
			cmp1 = {name: "cmp1"};
			cmp2 = {name: "cmp2"};
			cmp3 = {name: "cmp3"};
		},
		"only one key": function(){
			collection.whenDefined("cmp1", function(c1){
				assert.equal(c1, cmp1);
				assert.equal(this, collection);
				cbCalledCount++;
				return function() {
					cancelerCalledCount++;
				};
			});
			assert.equal(cbCalledCount, 0);
			assert.equal(cancelerCalledCount, 0);

			collection.set("cmp1", cmp1);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);

			collection.remove("cmp1");
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 1);

		},
		"two keys": function(){
			collection.whenDefined("cmp1", "cmp2", function(c1, c2){
				assert.equal(c1, cmp1);
				assert.equal(c2, cmp2);
				assert.equal(this, collection);
				cbCalledCount++;
				return function() {
					cancelerCalledCount++;
				};
			});
			assert.equal(cbCalledCount, 0);
			assert.equal(cancelerCalledCount, 0);

			collection.set("cmp1", cmp1);
			assert.equal(cbCalledCount, 0);
			assert.equal(cancelerCalledCount, 0);

			collection.set("cmp2", cmp2);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);

			collection.remove("cmp1");
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 1);

			collection.remove("cmp2");
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 1);
		},
		"canceler": function(){
			var canceler = collection.whenDefined("cmp1", "cmp2", function(c1, c2){
				cbCalledCount++;
			});
			canceler();
			collection.setEach({
				'cmp1': cmp1,
				'cmp2': cmp2,
			});
			assert.equal(cbCalledCount, 0);
		},
		"cb called only once on setEach": function() {
			collection.set("cmp1", "initCmp1");
			collection.whenDefined("cmp1", "cmp2", function(c1, c2){
				// console.log(c1, c2);
				cbCalledCount++;
			});
			collection.set('cmp2', 'intiCmp2');
			assert.equal(cbCalledCount, 1);

			collection.setEach({
				'cmp1': cmp2,
				'cmp2': cmp3,
			});
			assert.equal(cbCalledCount, 2);

		},
		"multi cb": function() {
			collection.whenDefined("cmp1", "cmp2", [
				function(c1, c2){
					assert.equal(c1, cmp2);
					assert.equal(c2, cmp3);
					cbCalledCount++;
					return function() {
						cancelerCalledCount++;
					};
				},
				function(c1, c2){
					assert.equal(c1, cmp2);
					assert.equal(c2, cmp3);
					cb2CalledCount++;
					return function() {
						canceler2CalledCount++;
					};
				},
			]);

			collection.setEach({
				'cmp1': cmp2,
				'cmp2': cmp3,
			});
			assert.equal(cbCalledCount, 1);
			assert.equal(cb2CalledCount, 1);

			collection.remove("cmp1");
			assert.equal(cancelerCalledCount, 1);
			assert.equal(canceler2CalledCount, 1);
		},
		"many whenDefined": function(){
			collection.whenDefined("cmp1", "cmp2", function(c1, c2){
				assert.equal(c1, cmp1);
				assert.equal(c2, cmp2);
				assert.equal(this, collection);
				cbCalledCount++;
				return function() {
					cancelerCalledCount++;
				};
			});
			collection.whenDefined("cmp2", "cmp3", function(c1, c2){
				assert.equal(c1, cmp2);
				assert.equal(c2, cmp3);
				assert.equal(this, collection);
				cb2CalledCount++;
				return function() {
					canceler2CalledCount++;
				};
			});
			assert.equal(cbCalledCount, 0);
			assert.equal(cancelerCalledCount, 0);
			assert.equal(cb2CalledCount, 0);
			assert.equal(canceler2CalledCount, 0);

			collection.setEach({
				"cmp1": cmp1,
				'cmp2': cmp2,
				'cmp3': cmp3,
			});
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);
			assert.equal(cb2CalledCount, 1);
			assert.equal(canceler2CalledCount, 0);

			collection.remove("cmp1");
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 1);
			assert.equal(cb2CalledCount, 1);
			assert.equal(canceler2CalledCount, 0);

			collection.remove("cmp2");
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 1);
			assert.equal(cb2CalledCount, 1);
			assert.equal(canceler2CalledCount, 1);
		},


	});

	registerSuite({
		name: "whenChanged",
		beforeEach: function(){
			collection = new ObservableObject();
			cbCalledCount = cb2CalledCount = 0;
			cancelerCalledCount = canceler2CalledCount = 0;
			cbArgs = undefined;
			cmp1 = {name: "cmp1"};
			cmp2 = {name: "cmp2"};
			cmp3 = {name: "cmp3"};
		},
		"only one key": function(){
			collection.whenChanged("cmp1", function(c1){
				cbArgs = arguments;
				assert.equal(this, collection);
				cbCalledCount++;
				return function() {
					cancelerCalledCount++;
				};
			});
			assert.deepEqual(cbArgs, [undefined]);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);

			collection.set("cmp1", cmp1);
			assert.deepEqual(cbArgs, [cmp1]);
			assert.equal(cbCalledCount, 2);
			assert.equal(cancelerCalledCount, 1);

			collection.remove("cmp1");
			assert.deepEqual(cbArgs, [undefined]);
			assert.equal(cbCalledCount, 3);
			assert.equal(cancelerCalledCount, 2);

		},
		"two keys": function(){
			collection.whenChanged("cmp1", "cmp2", function(c1, c2){
				cbArgs = arguments;
				assert.equal(this, collection);
				cbCalledCount++;
				return function() {
					cancelerCalledCount++;
				};
			});
			assert.deepEqual(cbArgs, [undefined, undefined]);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);

			collection.set("cmp1", cmp1);
			assert.deepEqual(cbArgs, [cmp1, undefined]);
			assert.equal(cbCalledCount, 2);
			assert.equal(cancelerCalledCount, 1);

			collection.set("cmp2", cmp2);
			assert.deepEqual(cbArgs, [cmp1, cmp2]);
			assert.equal(cbCalledCount, 3);
			assert.equal(cancelerCalledCount, 2);

			collection.remove("cmp1");
			assert.deepEqual(cbArgs, [undefined, cmp2]);
			assert.equal(cbCalledCount, 4);
			assert.equal(cancelerCalledCount, 3);

			collection.remove("cmp2");
			assert.deepEqual(cbArgs, [undefined, undefined]);
			assert.equal(cbCalledCount, 5);
			assert.equal(cancelerCalledCount, 4);
		},
		"canceler": function(){
			var canceler = collection.whenChanged("cmp1", "cmp2", function(c1, c2){
				cbCalledCount++;
			});
			assert.equal(cbCalledCount, 1);
			canceler();
			collection.setEach({
				'cmp1': cmp1,
				'cmp2': cmp2,
			});
			assert.equal(cbCalledCount, 1);
		},
		"cb called only once on setEach": function() {
			collection.whenChanged("cmp1", "cmp2", function(c1, c2){
				// console.log(c1, c2);
				cbCalledCount++;
			});
			assert.equal(cbCalledCount, 1);

			collection.setEach({
				'cmp1': cmp2,
				'cmp2': cmp3,
			});
			assert.equal(cbCalledCount, 2);

		},
		"multi cb": function() {
			collection.whenChanged("cmp1", "cmp2", [
				function(c1, c2){
					cbArgs = arguments;
					cbCalledCount++;
					return function() {
						cancelerCalledCount++;
					};
				},
				function(c1, c2){
					cb2Args = arguments;
					cb2CalledCount++;
					return function() {
						canceler2CalledCount++;
					};
				},
			]);
			assert.deepEqual(cbArgs, [undefined, undefined]);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);
			assert.deepEqual(cb2Args, [undefined, undefined]);
			assert.equal(cb2CalledCount, 1);
			assert.equal(canceler2CalledCount, 0);

			collection.setEach({
				'cmp1': cmp2,
				'cmp2': cmp3,
			});
			assert.deepEqual(cbArgs, [cmp2, cmp3]);
			assert.equal(cbCalledCount, 2);
			assert.equal(cancelerCalledCount, 1);
			assert.deepEqual(cb2Args, [cmp2, cmp3]);
			assert.equal(cb2CalledCount, 2);
			assert.equal(canceler2CalledCount, 1);

			collection.remove("cmp1");
			assert.deepEqual(cbArgs, [undefined, cmp3]);
			assert.equal(cbCalledCount, 3);
			assert.equal(cancelerCalledCount, 2);
			assert.deepEqual(cb2Args, [undefined, cmp3]);
			assert.equal(cb2CalledCount, 3);
			assert.equal(canceler2CalledCount, 2);
		},
		'not called when another key is changed': function() {
			collection.whenChanged("cmp1", function(c1){
				cbArgs = arguments;
				assert.equal(this, collection);
				cbCalledCount++;
				return function() {
					cancelerCalledCount++;
				};
			});
			assert.deepEqual(cbArgs, [undefined]);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);

			collection.set("cmp2", cmp2);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);
		},
		'canceled on destroy': function(){
			collection.whenChanged("cmp1", function(c1){
				cbArgs = arguments;
				assert.equal(this, collection);
				cbCalledCount++;
				return function() {
					cancelerCalledCount++;
				};
			});
			assert.deepEqual(cbArgs, [undefined]);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 0);

			collection.destroy();
			collection.set("cmp2", cmp2);
			assert.equal(cbCalledCount, 1);
			assert.equal(cancelerCalledCount, 1);
		}
	});

	var o;

	registerSuite({
		name: "bindSelection",
		beforeEach: function(){
			o = new ObservableObject();
			collection = new OrderableSet();
			cbCalledCount = cb2CalledCount = 0;
			cancelerCalledCount = canceler2CalledCount = 0;
			cmp1 = new ObservableObject({name: "cmp1"});
			cmp2 = new ObservableObject({name: "cmp2"});
			cmp3 = new ObservableObject({name: "cmp3"});
		},
		"bind without content": function(){
			o.bindSelection("activeItem", collection, "active");
			assert.equal(o.get("activeItem"), undefined);
		},
		"bind with existing content but no activeItem": function(){
			assert.equal(o.get("activeItem"), undefined);
			collection.addEach([cmp1, cmp2, cmp3]);
			cmp1.set("active", true);
			o.bindSelection("activeItem", collection, "active");
			assert.equal(o.get("activeItem"), undefined);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
		},
		"bind with existing content and one activeItem": function(){
			o.set("activeItem", cmp1);
			collection.addEach([cmp1, cmp2, cmp3]);
			o.bindSelection("activeItem", collection, "active");
			assert.equal(o.get("activeItem"), cmp1);
			assert.equal(cmp1.get("active"), true);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
		},
		"change activeItem": function() {
			o.set("activeItem", cmp1);
			collection.addEach([cmp1, cmp2, cmp3]);
			o.bindSelection("activeItem", collection, "active");
			assert.equal(o.get("activeItem"), cmp1);
			assert.equal(cmp1.get("active"), true);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
			o.set("activeItem", cmp2);
			assert.equal(o.get("activeItem"), cmp2);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), true);
			assert.equal(cmp3.get("active"), false);
		},
		"set an activeItem not in collection": function() {
			o.set("activeItem", cmp1);
			collection.addEach([cmp1, cmp2, cmp3]);
			o.bindSelection("activeItem", collection, "active");
			o.set("activeItem", null);
			assert.equal(o.get("activeItem"), null);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
		},
		"change one item": function() {
			collection.addEach([cmp1, cmp2, cmp3]);
			o.bindSelection("activeItem", collection, "active");
			cmp1.set("active", true);
			assert.equal(o.get("activeItem"), cmp1);
			assert.equal(cmp1.get("active"), true);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
			cmp2.set("active", true);
			assert.equal(o.get("activeItem"), cmp2);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), true);
			assert.equal(cmp3.get("active"), false);
		},
		"change all items to false": function() {
			o.set("activeItem", cmp1);
			collection.addEach([cmp1, cmp2, cmp3]);
			o.bindSelection("activeItem", collection, "active");
			cmp1.set("active", false);
			assert.equal(o.get("activeItem"), undefined);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
		},
		"add an item": function() {
			collection.addEach([cmp1, cmp2]);
			o.bindSelection("activeItem", collection, "active");
			assert.equal(o.get("activeItem"), undefined);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), false);
			collection.add(cmp3);
			o.set("activeItem", cmp3);
			assert.equal(o.get("activeItem"), cmp3);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), true);
			cmp3.set("active", false);
			assert.equal(o.get("activeItem"), undefined);
			assert.equal(cmp1.get("active"), false);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
		},
		"remove an item": function(){
			collection.addEach([cmp1, cmp2, cmp3]);
			o.bindSelection("activeItem", collection, "active");
			cmp1.set("active", true);
			collection.remove(2);
			cmp3.set("active", true); // should have no impact on activeItem
			assert.equal(o.get("activeItem"), cmp1);
			assert.equal(cmp1.get("active"), true);
			assert.equal(cmp2.get("active"), false);
		},
		"cancel binding": function(){
			collection.addEach([cmp1, cmp2, cmp3]);
			var canceler = o.bindSelection("activeItem", collection, "active");
			cmp1.set("active", true);
			canceler();
			o.set("activeItem", cmp3);
			assert.equal(o.get("activeItem"), cmp3);
			assert.equal(cmp1.get("active"), true);
			assert.equal(cmp2.get("active"), false);
			assert.equal(cmp3.get("active"), false);
		},

	});


});