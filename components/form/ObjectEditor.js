define([
	'compose',
	'ksf/dom/composite/Composite',
	'../HtmlContainer',
	'../HtmlElement',
], function(
	compose,
	Composite,
	HtmlContainer,
	HtmlElement
){
	return compose(
		Composite,
		function(args) {
			this.set('value', args.value || {}); // create a new value if none is provided

			var form = new HtmlContainer('form');
			var layout = [form, []];
			args.fields.forEach(function(field) {
				this._components.set(field.name, field.editor);
				layout[1].push([new HtmlContainer('label', {textContent: field.label}), [
					field.editor,
				]]);
			}, this);
			var submitButton = new HtmlElement('input', {type: 'submit', value: "Valider"});
			layout[1].push(submitButton);

			var changing = false;
			this.whenChanged('value', function(object) {
				if (!changing){
					args.fields.forEach(function(field) {
						field.editor.set('value', object && object[field.name]);
					});
				}
			});
			form.on('submit', function(e) {
				e.preventDefault();
				var object = {};
				args.fields.forEach(function(field) {
					object[field.name] = field.editor.get('value');
				});
				this.changing = true;
				this.set('value', object);
				this.changing = false;
			}.bind(this));

			this._layout.set('config', layout);

		}
	);

});