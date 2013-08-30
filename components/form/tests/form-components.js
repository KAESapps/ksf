define([
	"frb/bind",
	"put-selector/put",
	"dojo/on",
	"../Input",
	"../NumberInput",
	"../Checkbox",
	"../ColorInput",
	"../Select"
], function(bind, put, on, Input, NumberInput, Checkbox, ColorInput, Select){

	// test with value setted at construction time
	input = new Input({value: "test0"});
	put(document.body, input.render());
	input.set("inDom", true);
	on(put(document.body, "button", "reset value"), "click", function(){
		input.set("value", "test0");
	});
	bind(put(document.body, "div"), "innerHTML", {
		"<-": "value",
		source: input._presenter
	});


	// test with value setted after rendering but before dom insertion
	input1 = new Input();
	input1.set("value", "test1");
	document.body.appendChild(input1.render());
	input1.set("inDom", true);
	on(put(document.body, "button", "reset value"), "click", function(){
		input1.set("value", "test1");
	});
	bind(document.body.appendChild(document.createElement("div")), "innerHTML", {
		"<-": "value",
		source: input1._presenter
	});


	// test with value setted after dom insertion
	input2 = new Input();
	document.body.appendChild(input2.render());
	input2.set("inDom", true);
	input2.set("value", "test2");
	on(put(document.body, "button", "reset value"), "click", function(){
		input2.set("value", "test2");
	});
	bind(document.body.appendChild(document.createElement("div")), "innerHTML", {
		"<-": "value",
		source: input2._presenter
	});


	// test number input
	numberInput = new NumberInput({value: 10});
	document.body.appendChild(numberInput.render());
	numberInput.set("inDom", true);
	on(put(document.body, "button", "reset value"), "click", function(){
		numberInput.set("value", 10);
	});
	bind(document.body.appendChild(document.createElement("div")), "innerHTML", {
		"<-": "value",
		source: numberInput._presenter
	});
	// check that typeof numberInput.get("value") === "number"
	// check that user can enter decimal numbers


	// test checkbox input
	checkboxInput = new Checkbox({value: true});
	document.body.appendChild(checkboxInput.render());
	checkboxInput.set("inDom", true);
	on(put(document.body, "button", "reset value"), "click", function(){
		checkboxInput.set("value", true);
	});
	bind(document.body.appendChild(document.createElement("div")), "innerHTML", {
		"<-": "value",
		source: checkboxInput._presenter
	});

	// test color input
	colorInput = new ColorInput({value: "#ff0000"});
	document.body.appendChild(colorInput.render());
	colorInput.set("inDom", true);
	on(put(document.body, "button", "reset value"), "click", function(){
		colorInput.set("value", "#ff0000");
	});
	bind(document.body.appendChild(document.createElement("div")), "innerHTML", {
		"<-": "value",
		source: colorInput._presenter
	});
	// check that typeof colorInput.get("value") === "string"


	// test select input
	syv = {id: "syv", name: "Sylvain", age: 31, sexe: "M"};
	aur = {id: "aur", name: "Aurelie", age: 30, sexe:"F"};
	ant = {id: "ant", name: "Antonin", age: 2, sexe:"M"};
	leo = {id: "leo", name: "Léonie", age: 0, sexe:"F"};
	collection = [syv, aur, ant];

	selectInput = new Select({
		// options: collection,
		// value: "aur",
		labelProp: "name",
		valueProp: "id",
	});
	selectInput.set("options", collection);
	selectInput.set("value", "aur");
	document.body.appendChild(selectInput.render());
	selectInput.set("inDom", true);
	on(put(document.body, "button", "reset value"), "click", function(){
		selectInput.set("value", "aur");
	});
	bind(document.body.appendChild(document.createElement("div")), "innerHTML", {
		"<-": "value",
		source: selectInput._presenter
	});

	// collection.push(leo); // check that the options list is updated
	// collection.splice(1, 1); // check that the option list is updated (aur removed)


	// test js select
/*			syv = {name: "Sylvain", age: 31, sexe: "M"};
			aur = {name: "Aurelie", age: 30, sexe:"F"};
			ant = {name: "Antonin", age: 2, sexe:"M"};
			leo = {name: "Léonie", age: 0, sexe:"F"};
			collection = [syv, aur, ant];

			selectInput = new JsSelect({
				// options must be set at creation time and cannot be changed after
				options: collection,
				// labelProp must be set at creation time and cannot be changed after
				labelProp: "name",
				//TODO: create select children before binding selectedIndex, in order to have the initial value well selected (which is not the case actually : we need to set the value after selectInput creation)
				// value: aur,
			});
			document.body.appendChild(selectInput.render());
			selectInput.set("inDom", true);
			on(put(document.body, "button", "reset value"), "click", function(){
				selectInput.set("value", aur);
			});
			bind(document.body.appendChild(document.createElement("div")), "innerHTML", {
				"<-": "value.name",
				source: selectInput._presenter
			});
			selectInput.set("value", aur);
*/


});