define([
	'compose',
	'ksf/dom/composite/Composite',
	'ksf/collections/OrderableSet',
	'./List',
	'./ActiveList',
	'./HtmlContainer',
	'./HtmlElement'
], function(
	compose,
	Composite,
	OrderableSet,
	List,
	ActiveList,
	HtmlContainer,
	HtmlElement
){
	var ContainerWithActive = compose(
		HtmlContainer, function() {
			var self = this;

			this.domNode.addEventListener('click', function(){
				self.set("active", !self.get("active"));
			});

			this.getR('active').onValue(function(active) {
				self.style.set('active', active ? 'active' : 'inactive');
			});
		}
	);

	return compose(
		Composite,
		function(args) {
			var self = this;

			this._components.setEach({
				head: new List({
					container: new HtmlContainer('tr'),
					factory: function(column) {
						var head = column.head;
						// if head is a domComponent
						if (head && typeof head.get === 'function') {
							return new HtmlContainer('th', null, {
								content: [head],
							});
						}
						// fall back as rendering head as string
						return new HtmlElement('th', {textContent: head});
					},
				}),
				body: function() {
					var body = new ActiveList({
						container: new HtmlContainer('tbody'),
						factory: function(item){
							var row = new List({
								container: new ContainerWithActive('tr'),
								factory: function(column){
									var content = column.body(item);
									// if content is a domComponent
									if (content && typeof content.get === 'function') {
										return new HtmlContainer('td', null, {
											content: [content],
										});
									}
									// fall back as rendering content as string
									return new HtmlElement('td', {textContent: content});
								},
							});
							row.content.updateContentR(body.columns.asChangesStream());
							row._component.bind('active', row, 'active');
							return row;
						},
					});
					body.columns = new OrderableSet();
					return body;
				}(),
			});

			this.content = this._components.get('body').content;
			this.columns = this._components.get('body').columns;
			this.own([
				this._components.get('head').content.updateContentR(this.columns.asChangesStream()),
				this._components.get('body').bind('active', self, 'active'),
			]);

			this._root = new HtmlContainer('table');
			this._layout.set('config', [
				[new HtmlContainer('thead'), [
					'head',
				]],
				'body',
			]);

			args && this.setEach(args);
		}, {
			_contentSetter: function(content) {
				this.content.setContent(content || []);
			},
			_contentGetter: function() {
				return this.content;
			},
			_columnsSetter: function(columns) {
				this.columns.setContent(columns || []);
			},
			_columnsGetter: function() {
				return this.columns;
			}
		}
	);
});