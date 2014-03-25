define([
	'../compose',
	'compose',
], function(
	ksfCompose,
	dojoCompose
){
	var Person = function (name) {
		this.name = name;
	};
	Person.prototype = {
		greet: function(somebody) {
			return "Hello " + somebody;
		}
	};

	var WithJob = function(){
		this.job = arguments[1];
	};
	WithJob.prototype = {
		greet: function(somebody) {
			return  "Hello " + somebody + ", my name is " + this.name + " and I'm a " + this.job;
		},
	};

	var KsfEmployee = ksfCompose(Person, WithJob);
	var DojoEmployee = dojoCompose(Person, WithJob);

	JSLitmus.test('ksf compose', function() {
		return new KsfEmployee('syv', 'dev');
	});
	JSLitmus.test('dojo compose', function() {
		return new DojoEmployee('syv', 'dev');
	});


});