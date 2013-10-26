define([
	'intern!object',	'intern/chai!assert',
	'../SelectableList',
	'ksf/collections/OrderableSet',
	'ksf/collections/Set',
	'ksf/collections/Dict',
	"dojo/on",
	'compose',
	'ksf/dom/composite/Composite',
	'../HtmlContainer',
	'../form/Checkbox',
	'../HtmlElement',
], function(
	registerSuite, assert,
	SelectableList,
	OrderableSet,
	Set,
	Dict,
	on,
	compose,
	Composite,
	HtmlContainer,
	Checkbox,
	HtmlElement
){
	var SelectableLabel = compose(
		Composite,
		function(args) {
			this.set('label', args && args.label);
			this._components.setEach({
				container: new HtmlContainer('div'),
				selector: new Checkbox(),
				labelViewer: new HtmlElement('span'),
			});
			this._layout.set('config',
				['container', [
					'selector',
					'labelViewer',
				]]
			);

			this.own(
				this._components.get('labelViewer').setR('textContent', this.getR('label')),
				this._components.get('selector').bind('value', this, 'selected')
			);
		}, {
		}
	);

	var syv, aur, ant, leo, toto;
	var collection;
	var sl;
	var selectionChangesCount;
	var selectionObserver = function(changes) {
		selectionChangesCount ++;
	};

	registerSuite({
		name: 'order of arguments and dom insertion',
	});

	registerSuite({
		name: 'change selection',
		beforeEach: function() {
			collection = window.collection = new OrderableSet(['syv', 'aur', 'ant']);
			sl = window.sl = new SelectableList({
				content: collection,
				factory: function(item) {
					return new SelectableLabel({
						label: item,
					});
				},
			});
			selectionChangesCount = 0;
			sl.get('selection').asReactive().changes().onValue(selectionObserver);
			document.body.appendChild(sl.get('domNode'));
			sl.startLiveRendering();
		},
		"add item in selection": function() {
			sl.get('selection').add('aur');
			sl._component._component._content.forEach(function(selectable) {
				assert.equal(selectable.get('selected'), selectable.get('label') === 'aur');
			});
			assert.equal(selectionChangesCount, 1);
		},
		"add many items in selection": function() {
			sl.get('selection').addEach(['aur', 'ant']);
			sl._component._component._content.forEach(function(selectable) {
				assert.equal(selectable.get('selected'), new Set(['aur', 'ant']).has(selectable.get('label')));
			});
			assert.equal(selectionChangesCount, 1);
		},
		"remove item in selection": function() {
			sl.get('selection').addEach(['aur', 'ant']);
			sl.get('selection').remove('ant');
			sl._component._component._content.forEach(function(selectable) {
				assert.equal(selectable.get('selected'), selectable.get('label') === 'aur');
			});
			assert.equal(selectionChangesCount, 2);
		},
	});

	registerSuite({
		name: 'change content',
		beforeEach: function() {
			collection = window.collection = new OrderableSet(['syv', 'aur', 'ant']);
			sl = window.sl = new SelectableList({
				factory: function(item) {
					return new SelectableLabel({
						label: item,
					});
				},
			});
			selectionChangesCount = 0;
			sl.get('selection').asReactive().changes().onValue(selectionObserver);
			document.body.appendChild(sl.get('domNode'));
			sl.startLiveRendering();
		},
		'add item not in selection': function() {
			sl.set('content', collection);
			collection.add('leo');
			sl._component._component._content.forEach(function(selectable) {
				assert.equal(selectable.get('selected'), false);
			});
			assert.equal(selectionChangesCount, 0);
		},
		'add item already in selection': function() {
			sl.get('selection').add('ant');
			sl.set('content', collection);
			sl._component._component._content.forEach(function(selectable) {
				assert.equal(selectable.get('selected'), selectable.get('label') === 'ant');
			});
			assert.equal(selectionChangesCount, 1);
		},
	});
});