define([
	'intern!object',	'intern/chai!assert',
	"../ActiveList",
	"../HtmlElement",
	'../HtmlContainer'
], function(
	registerSuite, assert,
	ActiveList,
	HtmlElement,
	HtmlContainer
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('.active { background-color: red; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.selected { background-color: blue; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.movable { cursor: move; }', css.sheet.cssRules.length);

	console.time('list creation');
	var list = window.list = new ActiveList({
		container: new HtmlContainer('ul'),
		factory: function (item) {
			var li = new HtmlElement("li", {draggable: true});
			li.domAttrs.set("innerHTML", item.name);
			li.cssClasses.set('movable', 'movable');
			li.domNode.addEventListener("click", function(){
				li.set("active", !li.get("active"));
			});
			li.whenChanged('active', function(b) {
				if (b) {
					li.cssClasses.set('active', 'active');
				} else {
					li.cssClasses.remove('active');
				}
			});
			li.domNode.addEventListener('dragstart', function(ev) {
				ev.dataTransfer.setData('text/plain', list.content.indexOf(item));
			});
			li.domNode.addEventListener('dragover', function(ev) {
				ev.preventDefault();
			});
			li.domNode.addEventListener('drop', function(ev) {
				ev.preventDefault();
				var fromIndex = parseInt(ev.dataTransfer.getData('text/plain'), 10);
				var items = list.content;
				items.move(fromIndex, items.indexOf(item));
			});
			return li;
		},
		inList: true,
	});
	console.timeEnd('list creation');

	console.time('list dom insertion');
	document.body.appendChild(list.domNode);
	list.startLiveRendering();
	list.set('inDom', true);
	console.timeEnd('list dom insertion');

	var syv = window.syv = {name: "Sylvain", age: 31, sexe: "M"};
	var aur = window.aur = {name: "Aurélie", age: 30, sexe:"F"};
	var ant = window.ant = {name: "Antonin", age: 2, sexe:"M"};
	var leo = window.leo = {name: "Léonie", age: 1, sexe:"F"};


/*	list.getR('active').onValue(function(value) {
		console.log("active value:", value);
	});
	list.set("active", aur);
*/
	console.time('set collection');
	list.content.setContent([syv, aur, ant]);
	console.timeEnd('set collection');

/*	setTimeout(function() {
		console.time('set OrderableSet1');
		list.content.setContent([leo, ant]);
		console.log(list.domNode.offsetHeight);
		console.timeEnd('set OrderableSet1');
		console.time('set OrderableSet2');
		list.content.setContent([leo, ant, aur]);
		console.log(list.domNode.offsetHeight);
		console.timeEnd('set OrderableSet2');
	}, 1000);
*/
});