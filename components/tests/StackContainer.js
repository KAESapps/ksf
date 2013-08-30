define([
	'intern!object',	'intern/chai!assert',
	"put-selector/put",
	"../StackContainer",
], function(
	registerSuite, assert,
	put,
	StackContainer
){
	var syv = window.syv = {id: "syv", name: "Sylvain", age: 31, sexe: "M"};
	var aur = window.aur = {id: "aur", name: "Aurélie", age: 30, sexe:"F"};
	var ant = window.ant = {id: "ant", name: "Antonin", age: 2, sexe:"M"};
	var leo = window.leo = {id: "leo", name: "Léonie", age: 1, sexe:"F"};
	var collection = window.collection = [syv, aur, ant];

	var registry = {
		get: function(id){
			return put("div", collection[id].name);
		},
	};

	var container = window.container = new StackContainer({
		children: registry, //children can be anything with a "get" method that take "active" and return a component
		active: 2,
	});

	document.body.appendChild(container.domNode);


});