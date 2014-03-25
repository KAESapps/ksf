define([
	'intern!object',
	'intern/chai!assert',
	'../compose',
], function(
	registerSuite,
	assert,
	compose
) {
	registerSuite({
		"one arg of type object": function() {
			var Person = compose({
				greet: function(somebody) {
					return "Hello " + somebody;
				}
			});

			var syv = new Person();
			assert.equal(syv.greet("John"), "Hello John");
		},
		"one arg of type function": function() {
			var Person = compose(function (name) {
				this.nom = name;
			});

			var syv = new Person('syv');
			assert.equal(syv.nom, 'syv');
		},
		"one arg of type constructor": function() {
			var Person = function (name) {
				this.name = name;
			};
			Person.prototype = {
				greet: function(somebody) {
					return "Hello " + somebody;
				}
			};

			var Employee = compose(Person);

			var syv = new Employee('syv');
			assert.equal(syv.name, 'syv');
			assert.equal(syv.greet("John"), "Hello John");
		},
		"constructor and object": function() {
			var Person = function (name) {
				this.name = name;
			};
			Person.prototype = {
				greet: function(somebody) {
					return "Hello " + somebody;
				}
			};

			var Employee = compose(Person, {
				doWork: function() {
					return  "I'm working";
				},
			});

			var syv = new Employee('syv');
			assert.equal(syv.doWork(), "I'm working");
		},
	});
});