define([
	'intern!object',	'intern/chai!assert',
	'../MultiSelect',
	'ksf/collections/OrderableSet',
	'ksf/collections/Dict',
	"dojo/on",
], function(
	registerSuite, assert,
	MultiSelect,
	OrderableSet,
	Dict,
	on
){
	var syv, aur, ant, leo, toto;
	var collection;
	var ms;
	var observedSelection;
	var selectedObserverCalledCount;
	var selectedObserver = function(selected) {
		observedSelection = selected;
		selectedObserverCalledCount ++;
	};

	registerSuite({
		name: 'items of type string',
		beforeEach: function() {
			collection = window.collection = new OrderableSet(['syv', 'aur', 'ant']);
			ms = window.ms = new MultiSelect({
				options: collection,
			});
			ms.get('selection').asStream('changes').onValue(console, "log");
			document.body.appendChild(ms.get('domNode'));
		},
		"add item in selection": function() {
			ms.get('selection').add('aur');
			ms._component._component._content.forEach(function(selectable) {
				assert.equal(selectable.get('selected'), selectable.get('content') === 'aur');
			});
		},
	});
/*	registerSuite({
		name: 'items of type string, no args at creation and options set after dom insertion',
		beforeEach: function() {
			selectedObserverCalledCount = 0;
			observedSelected = undefined;
			collection = window.collection = new OrderableSet(['syv', 'aur', 'ant']);
			s = window.s = new MultiSelect();
			s.whenChanged('selection', selectedObserver);
			document.body.appendChild(s.get('domNode'));
		},
		"no options": function(){
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 0);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, undefined);
		},
		"set options": function() {
			s.set('options', collection);
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, undefined);
		},
		"select an item after options": function() {
			s.set('options', collection);
			s.set('value', 'aur');
			assert.equal(s.get('value'), 'aur');
			assert.equal(s.get('domNode').value, "aur");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, 'aur');
		},
		"select an item before options": function() {
			s.set('value', 'aur');
			assert.equal(s.get('value'), 'aur');
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 0);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, 'aur');

			s.set('options', collection);
			assert.equal(s.get('value'), 'aur');
			assert.equal(s.get('domNode').value, "aur");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2); // no change
			assert.equal(observedSelected, 'aur');
		},
		"user selected item": function() {
			s.set('options', collection);
			// simulate a user action
			s.get('domNode').selectedIndex = 1;
			on.emit(s.get('domNode'), "change", {
				bubbles: true,
				cancelable: true
			});
			assert.equal(s.get('value'), 'aur');
			assert.equal(s.get('domNode').value, "aur");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, 'aur');
		},
		"remove an item before the selected item": function() {
			s.set('options', collection);
			s.set('value', 'aur');
			collection.remove(0);
			assert.equal(s.get('value'), 'aur');
			assert.equal(s.get('domNode').value, "aur");
			assert.equal(s.get('domNode').selectedIndex, 0);
			assert.equal(s.get('domNode').children.length, 2);
			assert.equal(selectedObserverCalledCount, 2); // no change
			assert.equal(observedSelected, 'aur');
		},
		"remove an item after the selected item": function() {
			s.set('options', collection);
			s.set('value', 'aur');
			collection.remove(2);
			assert.equal(s.get('value'), 'aur');
			assert.equal(s.get('domNode').value, "aur");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 2);
			assert.equal(selectedObserverCalledCount, 2); // no change
			assert.equal(observedSelected, 'aur');
		},
		"remove the selected item": function() {
			s.set('options', collection);
			s.set('value', 'aur');
			collection.remove(1);
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 2);
			assert.equal(selectedObserverCalledCount, 3);
			assert.equal(observedSelected, undefined);
		},
		"select an item not in options": function() {
			s.set('options', collection);
			s.set('value', 'bidon');
			assert.equal(s.get('value'), 'bidon');
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, 'bidon');
		},
		"keep value undefined when changing options": function(){
			s.set('options', collection);
			var otherCollection = new OrderableSet(["syv", "aur", "ant", "leo"]);
			s.set('options', otherCollection);
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 4);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, undefined);
		},

		"keep value selected when changing options": function(){
			s.set('options', collection);
			s.set('value', 'aur');
			var otherCollection = new OrderableSet(["aur", "ant", "leo"]);
			s.set('options', otherCollection);
			assert.equal(s.get('value'), "aur");
			assert.equal(s.get('domNode').value, "aur");
			assert.equal(s.get('domNode').selectedIndex, 0);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, "aur");
		},

		"add the option after it was selected": function(){
			s.set('options', collection);
			s.set('value', 'leo');
			var otherCollection = new OrderableSet(["aur", "ant", "leo"]);
			s.set('options', otherCollection);
			assert.equal(s.get('value'), "leo");
			assert.equal(s.get('domNode').value, "leo");
			assert.equal(s.get('domNode').selectedIndex, 2);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, "leo");
		},
	});

	registerSuite({
		name: 'items of type ObservableDict and options set after dom insertion',
		beforeEach: function() {
			syv = window.syv = new Dict({id: "syv", name: "Sylvain", age: 31, sexe: "M"});
			aur = window.aur = new Dict({id: "aur", name: "Aurélie", age: 30, sexe:"F"});
			ant = window.ant = new Dict({id: "ant", name: "Antonin", age: 2, sexe:"M"});
			leo = window.leo = new Dict({id: "leo", name: "Léonie", age: 1, sexe:"F"});
			toto = window.toto = new Dict({id: "toto"});
			selectedObserverCalledCount = 0;
			observedSelected = undefined;
			collection = window.collection = new OrderableSet([syv, aur, ant]);
			s = window.s = new Select({
				labelProp: 'name',
			});
			document.body.appendChild(s.get('domNode'));
			s.whenChanged('value', selectedObserver);
		},
		"no options": function(){
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 0);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, undefined);
		},
		"set options": function() {
			s.set('options', collection);
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, undefined);
		},
		"select an item after options": function() {
			s.set('options', collection);
			s.set('value', aur);
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, aur);
		},
		"select an item before options": function() {
			s.set('value', aur);
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 0);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, aur);

			s.set('options', collection);
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2); // no change
			assert.equal(observedSelected, aur);
		},
		"user selected item": function() {
			s.set('options', collection);
			// simulate a user action
			s.get('domNode').selectedIndex = 1;
			on.emit(s.get('domNode'), "change", {
				bubbles: true,
				cancelable: true
			});
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, aur);
		},
		"remove an item before the selected item": function() {
			s.set('options', collection);
			s.set('value', aur);
			collection.remove(0);
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 0);
			assert.equal(s.get('domNode').children.length, 2);
			assert.equal(selectedObserverCalledCount, 2); // no change
			assert.equal(observedSelected, aur);
		},
		"remove an item after the selected item": function() {
			s.set('options', collection);
			s.set('value', aur);
			collection.remove(2);
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 2);
			assert.equal(selectedObserverCalledCount, 2); // no change
			assert.equal(observedSelected, aur);
		},
		"remove the selected item": function() {
			s.set('options', collection);
			s.set('value', aur);
			collection.remove(1);
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 2);
			assert.equal(selectedObserverCalledCount, 3);
			assert.equal(observedSelected, undefined);
		},
		"select an item not in options": function() {
			s.set('options', collection);
			s.set('value', toto);
			assert.equal(s.get('value'), toto);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, toto);
		},
		"keep value undefined when changing options": function(){
			s.set('options', collection);
			var otherCollection = new OrderableSet([syv, aur, ant, leo]);
			s.set('options', otherCollection);
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 4);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, undefined);
		},
		"keep value selected when changing options": function(){
			s.set('options', collection);
			s.set('value', aur);
			var otherCollection = new OrderableSet([aur, ant, leo]);
			s.set('options', otherCollection);
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 0);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, aur);
		},
		"change label of non selected item": function() {
			s.set('options', collection);
			s.set('value', aur);
			ant.set('name', "Antonin Vuilliot");
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, aur);
			assert.equal(s.get('domNode').children[2].text, "Antonin Vuilliot");
		},
		"change label of selected item": function() {
			s.set('options', collection);
			s.set('value', ant);
			ant.set('name', "Antonin Vuilliot");
			assert.equal(s.get('value'), ant);
			assert.equal(s.get('domNode').value, "Antonin Vuilliot");
			assert.equal(s.get('domNode').selectedIndex, 2);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 2);
			assert.equal(observedSelected, ant);
		},
		"stop observing item removed from collection": function() {
			s.set('options', collection);
			var antOption = s.get('domNode').children[2];
			collection.remove(2);
			ant.set('name', "Antonin Vuilliot");
			assert.equal(antOption.text, "Antonin");
		},
		"stop observing items after destroy": function() {
			s.set('options', collection);
			var antOption = s.get('domNode').children[2];
			s.destroy();
			ant.set('name', "Antonin Vuilliot");
			assert.equal(antOption.text, "Antonin");
			collection.remove(0);
			assert.equal(s.get('domNode').children.length, 3);
		},
	});
	registerSuite({
		name: 'args setting and dom insertion sequence',
		beforeEach: function() {
			syv = window.syv = new Dict({id: "syv", name: "Sylvain", age: 31, sexe: "M"});
			aur = window.aur = new Dict({id: "aur", name: "Aurélie", age: 30, sexe:"F"});
			ant = window.ant = new Dict({id: "ant", name: "Antonin", age: 2, sexe:"M"});
			leo = window.leo = new Dict({id: "leo", name: "Léonie", age: 1, sexe:"F"});
			toto = window.toto = new Dict({id: "toto"});
			selectedObserverCalledCount = 0;
			observedSelected = undefined;
			collection = window.collection = new OrderableSet([syv, aur, ant]);
		},
		"all args before dom insertion": function() {
			s = window.s = new Select({
				labelProp: 'name',
				options: collection,
				value: aur,
			});
			s.whenChanged('value', selectedObserver);
			document.body.appendChild(s.get('domNode'));
			assert.equal(s.get('value'), aur);
			assert.equal(s.get('domNode').value, "Aurélie");
			assert.equal(s.get('domNode').selectedIndex, 1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, aur);
		},
		"options but no value before dom insertion": function() {
			s = window.s = new Select({
				labelProp: 'name',
				options: collection,
			});
			s.whenChanged('value', selectedObserver);
			document.body.appendChild(s.get('domNode'));
			s.startLiveRendering(); // needed for chrome
			assert.equal(s.get('value'), undefined);
			assert.equal(s.get('domNode').value, "");
			assert.equal(s.get('domNode').selectedIndex, -1);
			assert.equal(s.get('domNode').children.length, 3);
			assert.equal(selectedObserverCalledCount, 1);
			assert.equal(observedSelected, undefined);
		},
	});
*/
});