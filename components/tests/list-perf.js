define([
	"../List",
	"../HtmlElement",
	'../HtmlContainer',
	'compose',
	'ksf/base/Evented',
], function(
	List,
	HtmlElement,
	HtmlContainer,
	compose,
	Evented
){
	// window.renderingLog =true;

	var syv = window.syv = {name: "Sylvain", age: 31, sexe: "M"};
	var aur = window.aur = {name: "Aurélie", age: 30, sexe:"F"};
	var ant = window.ant = {name: "Antonin", age: 2, sexe:"M"};
	var leo = window.leo = {name: "Léonie", age: 1, sexe:"F"};

	var content = window.content = [];
	for (var i=0; i < 100; i++) {
		content.push({name: i});
	}
/*	console.time("raw html");
	var ul = document.createElement("ul");
	document.body.appendChild(ul);

	content.forEach(function(item) {
		var li = document.createElement('li');
		li.textContent = item.name;
		ul.appendChild(li);
	});
	console.timeEnd("raw html");
*/
/*	console.time('list creation');
	var list = window.list = new List({
		container: new HtmlContainer('ul'),
		factory: function (item) {
			var li = new HtmlElement("li", {textContent: item.name});
			return li;
		},
	});
	console.timeEnd('list creation');

	console.time('list dom insertion');
	document.body.appendChild(list.domNode);
	list.startLiveRendering();
	list.set('inDom', true);
	console.timeEnd('list dom insertion');


	window.setContent = function() {
		console.time('set collection');
		list.content.setContent(content);
		console.timeEnd('set collection');
	};
*/

	var StateContainer = compose(Evented, function(initialValue) {
		this.setValue(initialValue);
	}, {
		getValue: function() {
			return this._state;
		},
		setValue: function(value) {
			value = value.toString();
			if (value.length <= 5) {
				this._state = value;
				this._emit('value', this._state);
			}
		},
		onValue: function(listener) {
			var canceler = this.on('value', listener);
			listener(this._state);
			return canceler.destroy;
		}
	});


	// sans cache JS du rendu
	var TextInput = function(intialValue) {
		this.domNode = document.createElement('input');
		this.domNode.type = "text";
		this.domNode.value = intialValue;
	};
	TextInput.prototype = {
		set: function(prop, value) {
			if (prop === 'value') {
				// la logique du composant pourrait être de coercer en text et de limiter à 30 caractères
				// là on délègue cette logique au <input>
				this.domNode.value = value;
			}
		},
		get: function(prop) {
			if (prop === 'value') {
				return this.domNode.value;
			}
		},
		on: function(eventName, cb) {
			if (eventName === 'valueChanged') {
				var domNode = this.domNode;
				var listener = function() {
					cb();
				};
				domNode.addEventListener('change', listener);
				return function() {
					domNode.removeEventListener('change', listener);
				};
			}
		},
		startLiveRendering: function() {
			return [];
		}, // always live rendering in dom
	};

	function createOldTextInput(i) {
			var el = new HtmlElement('input', {type: 'text'}, null, {
				'change': 'value',
			});
			el.domAttrs.set('value', i);
			el.domAttrs.getR('value').onValue(function(val) {
				console.log('value changed by user to', val);
			});
			return el;
	}

	function createLightTextInput(accessor) {
			var el = new TextInput(accessor.getValue());
			accessor.onValue(function(value) {
				console.log('value change from model', value);
				el.set('value', value);
			});
			el.on('valueChanged', function() {
				console.log('value changed by user to', el.get('value'));
				accessor.setValue(el.get('value'));
				console.log('reset value from model', accessor.getValue());
				el.set('value', accessor.getValue()); // on force une resynchronisation de l'affichage avec la valeur du model
			});
			return el;
	}


	window.createElements = function() {
		console.time('createElements');
		var el;
		var accessor;
		for (var i=0; i < 100; i++) {
			accessor = new StateContainer(i);
			el = createLightTextInput(accessor);
			document.body.appendChild(el.domNode);
			el.set('inDom', true);
			el.startLiveRendering();
			// el._applyAttrs();
			// el._applyBounds();
			// el._applyCssClasses();
			// el._applyStyle();
		}
		console.timeEnd('createElements');
	};

	window.createElementsInContainer = function() {
		console.time('createElementsInContainer');
		var container = new HtmlContainer('ul');
		for (var i=0; i < 100; i++) {
			var el = createOldTextInput(i);
			container.content.add(el);
		}
		document.body.appendChild(container.domNode);
		container.set('inDom', true);
		container.startLiveRendering();
		console.timeEnd('createElementsInContainer');
	};


});