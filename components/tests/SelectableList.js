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
				selector: new Checkbox(),
				labelViewer: new HtmlElement('span'),
			});
			this._root = new HtmlContainer('div');
			this._layout.set('config', [
				'selector',
				'labelViewer',
			]);

			this.own(
				this._components.get('labelViewer').domAttrs.setR('textContent', this.getR('label')),
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

	var assertSelectionEqual = function(expected) {
		assert.deepEqual(sl.get('selection').toArray().sort(), expected.sort()); // selection is a Set, so order is not relevant
	};
	var assertContentEqual = function(expected) {
		assert.deepEqual(sl.get('content').toArray(), expected);
	};
	var assertSelectablesEqual = function(expected) {
		var actual = sl._component._component._content;
		assert.equal(actual.length, expected.length);
		actual.forEach(function(selectable, index) {
			assert.equal(selectable.get('label'), expected[index][0]);
			assert.equal(selectable.get('selected'), expected[index][1]);
		});

	};

	registerSuite({
		name: 'order of arguments and dom insertion',
		'no args at creation': function() {
			sl = window.sl = new SelectableList({
				factory: function(item) {
					return new SelectableLabel({
						label: item,
					});
				},
			});
			// increase counter each time sl changes of 'selection' value or the value content changes
			sl.getChangesStream('selection').onValue(selectionObserver);
			selectionChangesCount = 0;

			document.body.appendChild(sl.domNode);
			sl.startLiveRendering();
			assert.equal(selectionChangesCount, 0);
			assertContentEqual([]);
			assertSelectionEqual([]);
			assertSelectablesEqual([
			]);

			sl.set('content', new OrderableSet(['syv', 'aur', 'ant']));
			assert.equal(selectionChangesCount, 0);
			assertSelectionEqual([]);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', false],
				['ant', false],
			]);

			sl.set('selection', new Set(['leo', 'aur', 'ant']));
			assert.equal(selectionChangesCount, 1);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', true],
			]);
		},
		'only content at creation': function() {
			sl = window.sl = new SelectableList({
				factory: function(item) {
					return new SelectableLabel({
						label: item,
					});
				},
				content: new OrderableSet(['syv', 'aur', 'ant']),
			});
			sl.getChangesStream('selection').onValue(selectionObserver);
			selectionChangesCount = 0;

			document.body.appendChild(sl.domNode);
			sl.startLiveRendering();
			assert.equal(selectionChangesCount, 0);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual([]);
			assertSelectablesEqual([
				['syv', false],
				['aur', false],
				['ant', false],
			]);

			sl.set('selection', new Set(['leo', 'aur', 'ant']));
			assert.equal(selectionChangesCount, 1);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', true],
			]);

		},
		'only selection at creation': function() {
			sl = window.sl = new SelectableList({
				factory: function(item) {
					return new SelectableLabel({
						label: item,
					});
				},
				selection: new Set(['leo', 'aur', 'ant']),
			});
			sl.getChangesStream('selection').onValue(selectionObserver);
			selectionChangesCount = 0;

			document.body.appendChild(sl.domNode);
			sl.startLiveRendering();
			assert.equal(selectionChangesCount, 0);
			assertContentEqual([]);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
			]);

			sl.set('content', new OrderableSet(['syv', 'aur', 'ant']));
			assert.equal(selectionChangesCount, 0);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', true],
			]);
		},
		'both at creation': function() {
			sl = window.sl = new SelectableList({
				factory: function(item) {
					return new SelectableLabel({
						label: item,
					});
				},
				selection: new Set(['leo', 'aur', 'ant']),
				content: new OrderableSet(['syv', 'aur', 'ant']),
			});
			sl.getChangesStream('selection').onValue(selectionObserver);
			selectionChangesCount = 0;

			document.body.appendChild(sl.domNode);
			sl.startLiveRendering();
			assert.equal(selectionChangesCount, 0);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', true],
			]);
		},
	});

	var init0 = function() {
		sl = window.sl = new SelectableList({
			factory: function(item) {
				return new SelectableLabel({
					label: item,
				});
			},
			selection: new Set(['leo', 'aur', 'ant']),
			content: new OrderableSet(['syv', 'aur', 'ant']),
		});
		sl.getChangesStream('selection').onValue(selectionObserver);
		selectionChangesCount = 0;

		document.body.appendChild(sl.domNode);
		sl.startLiveRendering();
	};

	registerSuite({
		name: 'change selection',
		beforeEach: init0,
		"add item in selection": function() {
			sl.get('selection').add('syv');
			assert.equal(selectionChangesCount, 1);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur', 'ant', 'syv']);
			assertSelectablesEqual([
				['syv', true],
				['aur', true],
				['ant', true],
			]);
		},
		"remove item in selection": function() {
			sl.get('selection').remove('ant');
			assert.equal(selectionChangesCount, 1);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', false],
			]);
		},
		"change selection object": function() {
			sl.set('selection', new Set(['leo', 'aur']));
			assert.equal(selectionChangesCount, 1);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', false],
			]);
		},
		"change selected property to true": function() {
			var syvSelectable = sl._component._component._content.get(0);
			syvSelectable.set('selected', true);
			assert.equal(selectionChangesCount, 1);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'aur', 'ant', 'syv']);
			assertSelectablesEqual([
				['syv', true],
				['aur', true],
				['ant', true],
			]);
		},
		"change selected property to false": function() {
			var aurSelectable = sl._component._component._content.get(1);
			aurSelectable.set('selected', false);
			assert.equal(selectionChangesCount, 1);
			assertContentEqual(['syv', 'aur', 'ant']);
			assertSelectionEqual(['leo', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', false],
				['ant', true],
			]);
		},
	});

	registerSuite({
		name: 'change content',
		beforeEach: init0,
		'add item not in selection': function() {
			sl.get('content').add('toto');
			assert.equal(selectionChangesCount, 0);
			assertContentEqual(['syv', 'aur', 'ant', 'toto']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', true],
				['toto', false],
			]);
		},
		'add item already in selection': function() {
			sl.get('content').add('leo');
			assert.equal(selectionChangesCount, 0);
			assertContentEqual(['syv', 'aur', 'ant', 'leo']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['syv', false],
				['aur', true],
				['ant', true],
				['leo', true],
			]);
		},
		'change whole content': function() {
			sl.set('content', new OrderableSet(['leo', 'syv']));
			assert.equal(selectionChangesCount, 0);
			assertContentEqual(['leo', 'syv']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['leo', true],
				['syv', false],
			]);
		},
	});

	registerSuite({
		name: 'destroy',
		beforeEach: init0,
		'bindIsIn is canceled': function() {
			var syvSelectable = sl._component._component._content.get(0);
			sl.get('content').remove(0);
			syvSelectable.set('selected', true);
			assert.equal(selectionChangesCount, 0);
			assertContentEqual(['aur', 'ant']);
			assertSelectionEqual(['leo', 'aur', 'ant']);
			assertSelectablesEqual([
				['aur', true],
				['ant', true],
			]);
		},
		'selection is no more updated after destroy': function() {
			var syvSelectable = sl._component._component._content.get(0);
			sl.destroy();
			syvSelectable.set('selected', true);
			assert.equal(selectionChangesCount, 0);
		},
	});
});