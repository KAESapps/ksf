define([
	'compose',
	'ksf/dom/composite/Composite',
	'./List',
	'./ActiveList',
	'./HtmlContainer',
	'./HtmlContainerIncremental',
	'ksf/dom/WithActive',
	'./HtmlElement',
	'ksf/utils/bindProps',
], function(
	compose,
	Composite,
	List,
	ActiveList,
	HtmlContainer,
	HtmlContainerIncremental,
	WithActive,
	HtmlElement,
	bindProps
){
	var ContainerWithActive = compose(
		HtmlContainerIncremental,
		WithActive
	);

	return compose(
		Composite,
		function() {
			var self = this;
			this._components.factories.addEach({
				head: function() {
					return new List({
						container: new HtmlContainerIncremental('tr'),
						factory: function(column) {
							if (typeof column.head === 'string') {
								return new HtmlElement('th', {textContent: column.head});
							}
							return new HtmlContainer('th', {
								content: [column.head],
							});
						},
					});
				},
				body: function() {
					var body = new ActiveList({
						container: new HtmlContainerIncremental('tbody'),
						factory: function(item){
							var row = new List({
								container: new ContainerWithActive('tr'),
								factory: function(column){
									var content = column.body.factory(item);
									if (typeof content === 'string'){
										return new HtmlElement('td', {textContent: content});
									}
									return new HtmlContainer('td', {
										content: [content],
									});
								},
							});
							row.setR('content', body.getR('columns'));
							row._component.bind('active', row, 'active');
							return row;
						},
					});
					return body;
				},
			});

			this._components.whenDefined('head',
				bindProps('content', '<', 'columns').bind(self)
			);
			this._components.whenDefined('body', [
				bindProps('content', '<', 'content').bind(self),
				bindProps('columns', '<', 'columns').bind(self),
				bindProps('active', '<<->', 'active').bind(self),
			]);

			this._layout.set('config', [
				new HtmlContainer('table'), [[
					new HtmlContainer('thead'), [
						'head',
					]],
					'body',
				]
			]);
		}
	);
});