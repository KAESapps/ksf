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
		function(args) {
			var self = this;
			this.setEach(args);

			this._components.setEach({
				head: new List({
					container: new HtmlContainerIncremental('tr'),
					factory: function(column) {
						var head = column.head;
						// if head is a domComponent
						if (head && typeof head.get === 'function') {
							return new HtmlContainer('th', {
								content: [head],
							});
						}
						// fall back as rendering head as string
						return new HtmlElement('th', {textContent: head});
					},
				}),
				body: function() {
					var body = new ActiveList({
						container: new HtmlContainerIncremental('tbody'),
						factory: function(item){
							var row = new List({
								container: new ContainerWithActive('tr'),
								factory: function(column){
									var content = column.body(item);
									// if content is a domComponent
									if (content && typeof content.get === 'function') {
										return new HtmlContainer('td', {
											content: [content],
										});
									}
									// fall back as rendering content as string
									return new HtmlElement('td', {textContent: content});
								},
							});
							row.setR('content', body.getR('columns'));
							row._component.bind('active', row, 'active');
							return row;
						},
					});
					return body;
				}(),
			});

			this.own([
				this._components.get('head').setR('content', self.getR('columns')),

				this._components.get('body').setR('content', self.getR('content')),
				this._components.get('body').setR('columns', self.getR('columns')),
				this._components.get('body').bind('active', self, 'active'),
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