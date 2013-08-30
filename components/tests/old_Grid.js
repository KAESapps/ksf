define([
	'intern!object',	'intern/chai!assert',
	"../Grid",
	"frb/bind",
	"frb/observe",
	"collections/sorted-array",
	"ksf/utils/frb-dom",
], function(
	registerSuite, assert,
	Grid,
	bind,
	observe,
	SortedArray
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('.active { background-color: red; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.selected { background-color: blue; }', css.sheet.cssRules.length);

	var grid = window.grid = new Grid({
	});
	document.body.appendChild(grid.domNode);

	var syv = window.syv = {name: "Sylvain", age: 31, sexe: "M"};
	var aur = window.aur = {name: "Aurélie", age: 30, sexe:"F"};
	var ant = window.ant = {name: "Antonin", age: 2, sexe:"M"};
	var leo = window.leo = {name: "Léonie", age: 1, sexe:"F"};
	var collection = window.collection = [syv, aur, ant];


	grid.value = collection;

	var DivRenderer = function(prop){
		return {
			create: function(item, cell){
				var cmp = document.createElement("input");
				cmp.destroy = bind(cmp, "value", {
					"<->": prop,
					source: item,
				});
				return cmp;
			},
			destroy: function(cmp){
				cmp.destroy();
			},
			place: function(input, td){
				td.appendChild(input);
			},
			unplace: function(input, td){
				td.removeChild(input);
			},
		};
	};
	var DeleteButton = function(collection){
		return {
			create: function(item, cell){
				var button = document.createElement("button");
				button.innerHTML = "X";
				cell.deleteClickHandler = function(ev){
					collection.splice(cell.item.index, 1);
				};
				button.addEventListener("click", cell.deleteClickHandler);
				return button;
			},
			destroy: function (button, cell) {
				button.removeEventListener("click", cell.deleteClickHandler);
			},
			place: function(el, td){
				td.appendChild(el);
			},
			unplace: function(el, td){
				td.removeChild(el);
			},
		};
	};
	var MoveButton = function(collection, direction){
		var cb;
		return {
			create: function(item, cell){
				var button = document.createElement("button");
				button.innerHTML = (direction === 1 ? "v" : "^");
				cb = function(){
					var index = cell.item.index;
					collection.splice(index, 1);
					collection.splice(index+direction, 0, item);
				};
				button.addEventListener("click", cb);
				return button;
			},
			destroy: function (button) {
				button.removeEventListener("click", cb);
			},
			place: function(el, td){
				td.appendChild(el);
			},
			unplace: function(el, td){
				td.removeChild(el);
			},
		};
	};
	var ActionButtons = function(collection){
		var del = DeleteButton(collection);
		var up = MoveButton(collection, -1);
		var down = MoveButton(collection, 1);
		return {
			create: function(item, cell){
				return [
					del.create(item, cell),
					up.create(item, cell),
					down.create(item, cell),
				];
			},
			destroy: function (buttons, cell) {
				del.destroy(buttons[0], cell);
				up.destroy(buttons[1], cell);
				down.destroy(buttons[2], cell);
			},
			place: function(buttons, td){
				buttons.forEach(td.appendChild, td);
			},
			unplace: function(buttons, td){
				buttons.forEach(td.removeChild, td);
			},
		};
	};

	var Sorter = function(prop, label, grid){
		return {
			create: function(cell){
				this.view = cell;
				this.grid = grid;
				this.view.innerHTML = label;
			},
			destroy: function(){
			},
			sort: function(){
				if (this.direction === 1){
					// sort in descending order
					this.direction = -1;
					this.view.innerHTML = label + " (z->a)";
					this.grid.value = new SortedArray(this.grid.value, null, function compare(b, a) {
						if (a[prop] < b[prop])	return -1;
						if (a[prop] > b[prop])	return 1;
						return 0;
					});

				} else if (!this.direction || this.direction === -1) {
					// sorting in ascending order
					this.direction = 1;
					this.view.innerHTML = label + " (a->z)";
					this.grid.value = new SortedArray(this.grid.value, null, function compare(a, b) {
						if (a[prop] < b[prop])	return -1;
						if (a[prop] > b[prop])	return 1;
						return 0;
					});
				}
			},
			unsort: function(){
				this.view.innerHTML = label;
				this.direction = 0;
			},
		};
	};

	var Selector = function(grid){
		return {
			create: function(item, cell){
				var cmp = document.createElement("button");
				cmp.clickHandler = function(ev){
					if (grid.selection.has(item)){
						grid.selection.delete(item);
					} else {
						grid.selection.add(item);
					}
				};
				cmp.addEventListener("click", cmp.clickHandler);
				return cmp;
			},
			destroy: function(cmp){
				cmp.removeEventListener("click", cmp.clickHandler);
			},
			place: function(el, td){
				td.appendChild(el);
			},
			unplace: function(el, td){
				td.removeChild(el);
			},
		};
	};


	var config = window.config = [{
		title: "Selection",
		renderer: Selector(grid),
	}, {
		header: Sorter("name", "Nom", grid),
		renderer: DivRenderer("name")
	}, {
		header: Sorter("age", "Age", grid),
		renderer: DivRenderer("age")
	},
		{title: "Actions", renderer: ActionButtons(collection)},
	];
	grid.config = config;

	// add column
	// config.push({label: "Age", property: "age"});

	// add row
	collection.push(leo);

	// sort collection
	// collection.reverse();

	// sort columns
	// config.reverse();

	// select via a click

	// select programatically

	// observe activeItem
	observe(grid, "activeItem", function(item){
		console.log("active item changed to", item.name);
	});
	observe(grid, "activeItemIndex", function(index){
		console.log("active item index changed to", index);
	});

});