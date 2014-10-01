define([
	'intern!object',
	'intern/chai!assert',
	'../mixinProperties',
], function(
	registerSuite,
	assert,
	mixin
) {

	var target, simpleliteralObject, literalObjectWithAccessors, valueDescriptors, accessorDescriptors, personInstance;
	var propDesc = Object.getOwnPropertyDescriptor;

	var Person = function(name){
		this.name = name;
	};
	Person.prototype.describe = function(){
		return "I'm "+this.name;
	};

	registerSuite({
		name : "mixinProperties",
		beforeEach : function() {
			target = {name: "toto"};
			simpleliteralObject = {age: 3, friend: "titi", cool: true, address: {city: "Choisy"}, birthDate: new Date()};
			literalObjectWithAccessors = {
				_job: "student",
				get job(){return this._job;},
				set job(job){this._job = job;}
			};
			valueDescriptors = {
				dog: {
					value: "medor",
					enumerable: true,
				}
			};
			accessorDescriptors = {
				color: {
					get: function(){return "red";}
				}
			};
			personInstance = new Person("tata");

		},
		"simpleliteralObject": function(){
			mixin(target, simpleliteralObject);
			assert.deepEqual(propDesc(target, "age"), propDesc(simpleliteralObject, "age"));
			assert.equal(target.address.city, "Choisy");
			assert.equal(target.birthDate, simpleliteralObject.birthDate);
		},
		"literalObjectWithAccessors": function(){
			mixin(target, literalObjectWithAccessors);
			assert.deepEqual(propDesc(target, "job"), propDesc(literalObjectWithAccessors, "job"));
			assert.equal(target.job, "student");
			target.job = "cowboy";
			assert.equal(target.job, "cowboy");
		},
		"accessors must not be called at mixin time": function(){
			var called = false;
			mixin(target, {
				get data(){
					called = true;
					return this._data;
				}
			});
			assert.isFalse(called);
			target._data = "test";
			assert.equal(target.data, "test");
			assert(called);
		},
		"valueDescriptors": function(){
			mixin(target, valueDescriptors);
			assert.deepEqual(propDesc(target, "dog"), {value: "medor", writable: false, enumerable: true, configurable: false});
			assert.equal(target.dog, "medor");
		},
		"accessorDescriptors": function(){
			mixin(target, accessorDescriptors);
			assert.deepEqual(propDesc(target, "color"), {
				enumerable: false,
				configurable: false,
				get: accessorDescriptors.color.get,
				set: undefined,
			});
			assert.equal(target.color, "red");
		},
		"multi sources": function(){
			mixin(target, simpleliteralObject, literalObjectWithAccessors, valueDescriptors, accessorDescriptors);
			assert.equal(target.age, 3);
			assert.equal(target.address.city, "Choisy");
			assert.equal(target.job, "student");
			assert.equal(target.dog, "medor");
			assert.equal(target.color, "red");
		},
		"property override": function(){
			var otherAgeProperty = {age: 5};
			mixin(target, simpleliteralObject, otherAgeProperty);
			assert.deepEqual(propDesc(target, "age"), propDesc(otherAgeProperty, "age"));
			assert.equal(target.age, 5);
		},
		"copy only own properties": function(){
			mixin(target, personInstance);
			assert(target.describe === undefined);
		},
		"copy non enumerable properties": function(){
			var objectWithNonEnumerableProperties = Object.create(null, {
				nonEnumProp: {
					value: "test"
				}
			});
			assert.deepEqual(Object.keys(objectWithNonEnumerableProperties), []);
			mixin(target, objectWithNonEnumerableProperties);
			assert.equal(target.nonEnumProp, "test");
		}
	});

});