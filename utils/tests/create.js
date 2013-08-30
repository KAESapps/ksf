define([
	"doh/runner",
	"../create",
], function(doh, create){
	
	//standard constructor declaration
	window.Person = create(null, function Person(params){
		this.name = params.name;
	}, {
		describe: function(){
			return "My name is "+this.name;
		},
		getName: function(){
			return this.name;
		},
	}, {
		className: "Person",
		getName: function(){return this.name},
		getDescription: function(){return "I'm class "+this.getName()},
	});
	
	//new Constructor that inherit prototype AND statics methods from Person
	window.Worker = create(Person, function Worker(params){
		this.superConstructor.call(this, params);
		this.job = params.job;
	}, {
		describe: function(){
			//var superReturn = Object.getPrototypeOf(Object.getPrototypeOf(this)).describe.call(this, arguments); 
			var superReturn = this.super.describe.call(this, arguments); 
			return superReturn+" and my job is "+this.job;
		},
	}, {
		className: "Worker",
		getDescription: function(){
			var superReturn = this.super.getDescription.call(this);
			return superReturn + " and I'm subClass of " + this.super.getName();
		},
	});

	window.toto = new Person({name:"toto", age: 30});
	window.titi = new Worker({name:"titi", age: 30, job: "coder"});

	doh.register("extend tests", [
		function instanceOfPerson(t){
			t.t(Person.prototype.isPrototypeOf(toto));
			t.t(toto instanceof Person);
			t.is("toto", toto.name);
			t.f(toto.age);
			t.f(toto.job);
		},
		function instanceMethodOnPerson(t){
			t.is("My name is toto", toto.describe());
			t.is("toto", toto.getName());
		},
		function classMethodOnPerson(t){
			t.is("Person", Person.getName());
			t.is("I'm class Person", Person.getDescription());
		},
		function instanceOfWorker(t){
			t.t(Person.prototype.isPrototypeOf(titi));
			t.t(Worker.prototype.isPrototypeOf(titi));
			t.t(titi instanceof Person);
			t.t(titi instanceof Worker);
			t.is("titi", titi.name);
			t.is("coder", titi.job);
			t.f(titi.age);
		},
		function instanceInheritedMethodOnWorker(t){
			t.is("titi", titi.getName());
		},
		//instanceNewMethodOnWorker
		function instanceSurchargedMethodOnWorker(t){
			t.is("My name is titi and my job is coder", titi.describe());
		},
		function classInheritedMethodOnWorker(t){
			t.is("Worker", Worker.getName());
		},
		//classNewMethodOnWorker
		function classSurchargedMethodOnWorker(t){
			t.is("I'm class Worker and I'm subClass of Person", Worker.getDescription());
		},
		
	]);


});