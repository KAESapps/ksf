define([
	'intern!object',	'intern/chai!assert',
	"../Grid",
	"ksf/collections/OrderableSet",
	'../HtmlElement',
	'../Select',
	'ksf/collections/Dict',

], function(
	registerSuite, assert,
	Grid,
	OrderableSet,
	HtmlElement,
	Select,
	Dict
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('.active { background-color: red; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.selected { background-color: blue; }', css.sheet.cssRules.length);


	var syv = window.syv = new Dict({name: "Sylvain", age: 31, genre: "M"});
	var aur = window.aur = new Dict({name: "Aurélie", age: 30, genre:"F", conjoint: syv});
	var ant = window.ant = new Dict({name: "Antonin", age: 2, genre:"M"});
	var leo = window.leo = new Dict({name: "Léonie", age: 1, genre:"F"});
	syv.set('conjoint', aur);
	var collection = window.collection = new OrderableSet([syv, aur, ant]);

	var grid = window.grid = new Grid({});
	document.body.appendChild(grid.get('domNode'));
	grid.startLiveRendering();

	grid.set('content', collection);

	var columns = window.columns = new OrderableSet([{
		head: new HtmlElement('button', {textContent: "Nom"}),
		body: {
			factory : function(item) {
				return new HtmlElement('div', {innerHTML: item.get('name')});
			},
		}
	}, {
		head: "Age",
		body: {
			factory : function(item) {
				return new HtmlElement('input', {value: item.get('age')});
			},
		}
	}, {
		head: "Conjoint",
		body: {
			factory : function(item) {
				var s = new Select({
					labelProp: 'name',
					options: collection,
				});
				s.bind('value', item, 'conjoint');
				return s;
			},
		}
	}]);

	grid.set('columns', columns);
	grid.set('active', ant);

	// add column
	columns.add({
		head: "Genre",
		body: {
			factory : function(item) {
				return new HtmlElement('input', {value: item.get('genre')});
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