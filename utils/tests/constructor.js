define([
	'intern!object',
	'intern/chai!assert',
	'../constructor',
], function(
	registerSuite,
	assert,
	ctr
) {
	registerSuite({
		name : "inheritance",
		"all arguments": function(){
			var Person = ctr(Object, function Person (name){
				this.name = name;
			}, {
				describe: function(){
					return "I'm "+this.name;
				}
			});
			window.toto = new Person("toto");
			console.log(toto);

			var Worker = Person.extends(function Worker (name, job){
				this.job = job;
			}, {
				describe: function(){
					return Person.prototype.describe.apply(this, arguments) + " and my job is " + this.job;
				},
				get longueur(){ return this.name.length;},
			});

			window.syv = new Worker("syv", "coder");
			console.log(syv);
		},
	});
});