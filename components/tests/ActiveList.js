define([
	'intern!object',	'intern/chai!assert',
	"../ActiveList",
	"../HtmlElement",
	'../HtmlContainerIncremental',
	"dojo/dom-class",
	"ksf/collections/OrderableSet",
], function(
	registerSuite, assert,
	ActiveList,
	HtmlElement,
	HtmlContainerIncremental,
	domClass,
	OrderableSet
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('.active { background-color: red; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.selected { background-color: blue; }', css.sheet.cssRules.length);

	var list = window.list = new ActiveList({
		container: new HtmlContainerIncremental('ul'),
		factory: function (item) {
			var li = new HtmlElement("li");
			li.set("innerHTML", item.name);
			li.get("domNode").addEventListener("click", function(){
				li.set("active", !li.get("active"));
			});
			li.whenChanged('active', function(b) {
				if (b) {
					li.style.set('active', 'active');
				} else {
					li.style.remove('active');
				}
			});
			return li;
		},
	});

	document.body.appendChild(list.get("domNode"));
	list.startLiveRendering();

	var syv = window.syv = {name: "Sylvain", age: 31, sexe: "M"};
	var aur = window.aur = {name: "Aurélie", age: 30, sexe:"F"};
	var ant = window.ant = {name: "Antonin", age: 2, sexe:"M"};
	var leo = window.leo = {name: "Léonie", age: 1, sexe:"F"};
	var collection = window.collection = new OrderableSet([syv, aur, ant]);


	list.getR('active').onValue(function(value) {
		console.log("active value:", value);
	});
	list.set("active", aur);

	console.time('set collection');
	list.set("content", collection);
	console.timeEnd('set collection');

	setTimeout(function() {
		console.time('set OrderableSet1');
		list.set("content", new OrderableSet([leo, ant]));
		console.log(list.get('domNode').offsetHeight);
		console.timeEnd('set OrderableSet1');
		console.time('set OrderableSet2');
		list.set("content", new OrderableSet([leo, ant, aur]));
		console.log(list.get('domNode').offsetHeight);
		console.timeEnd('set OrderableSet2');
	}, 1000);

});