define([
	'intern!object',	'intern/chai!assert',
	'../MultiSelect',
	'../List',
	'ksf/collections/OrderableSet',
	'ksf/collections/Set',
	'ksf/collections/Dict',
	"dojo/on",
	'compose',
	'ksf/dom/composite/Composite',
	'../HtmlContainerIncremental',
	'../form/Checkbox',
	'../HtmlElement',
], function(
	registerSuite, assert,
	MultiSelect,
	List,
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
	var syv, aur, ant, leo, toto;
	var collection;
	var sl;
	var selectionChangesCount;
	var selectionObserver = function(changes) {
		selectionChangesCount ++;
	};

	var ms = window.ms = new MultiSelect({
		options: new OrderableSet(['syv', 'aur', 'ant']),
		selection: new Set(['aur']),
	});
	document.body.appendChild(ms.get('domNode'));
	ms.startLiveRendering();

	var l = window.l = new List({
		container: new HtmlContainer('ul'),
		content: new OrderableSet(),
		factory: function(item) {
			return new HtmlElement('li', {
				innerHTML: item,
			});
		},
	});
	document.body.appendChild(l.get('domNode'));
	l.startLiveRendering();

	l.get('content').updateContentR(ms.get('selection').asChangesStream().map(function(changes) {
		return changes.map(function(change) {
			if (change.type === 'remove'){
				change.index = l.get('content').indexOf(change.value);
			}
			return change;
		});
	}));

	ms.get('selection').add('leo');
	ms.get('options').add('leo');
});