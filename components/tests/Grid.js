define([
	'intern!object',	'intern/chai!assert',
	"../Grid",
	"ksf/collections/OrderableSet",
	'../HtmlElement',

], function(
	registerSuite, assert,
	Grid,
	OrderableSet,
	HtmlElement
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('.active { background-color: red; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.selected { background-color: blue; }', css.sheet.cssRules.length);


	var syv = window.syv = {name: "Sylvain", age: 31, genre: "M"};
	var aur = window.aur = {name: "Aurélie", age: 30, genre:"F"};
	var ant = window.ant = {name: "Antonin", age: 2, genre:"M"};
	var leo = window.leo = {name: "Léonie", age: 1, genre:"F"};
	var collection = window.collection = new OrderableSet([syv, aur, ant]);

	var grid = window.grid = new Grid({});
	document.body.appendChild(grid.get('domNode'));

	grid.set('content', collection);

	var columns = window.columns = new OrderableSet([{
		head: {
			label: "Nom"
		},
		body: {
			factory : function(item) {
				return new HtmlElement('div', {innerHTML: item.name});
			},
		}
	}, {
		head: {
			label: "Age",
		},
		body: {
			factory : function(item) {
				return new HtmlElement('input', {value: item.age});
			},
		}
	}]);

	grid.set('columns', columns);
	grid.set('active', ant);

	// add column
	columns.add({
		head: {label: "Genre"},
		body: {
			factory : function(item) {
				return new HtmlElement('input', {value: item.genre});
			},
		}
	});

	// add row
	collection.add(leo);

	// sort collection
	// collection.reverse();

	// sort columns
	// config.reverse();

	// select via a click

	// select programatically

	// observe activeItem
/*	observe(grid, "activeItem", function(item){
		console.log("active item changed to", item.name);
	});
	observe(grid, "activeItemIndex", function(index){
		console.log("active item index changed to", index);
	});
*/
});