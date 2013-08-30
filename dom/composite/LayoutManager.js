define([
	'compose',
	'collections/dict',
	'ksf/collections/AttributeTree',
	'ksf/collections/ObservableObject'
], function(
	compose,
	Dict,
	Tree,
	ObservableObject
){
	return compose(ObservableObject,
		function(args) {
			this._registry = args.registry;
			this.configs = new Dict();
		},
		{
			apply: function() {
				var config = this.get('config');
				if (config === this._appliedConfig) {
					return;
				}

				var tree = new Tree(config);

				// map tree of ids to tree of components
				var cmpTree = tree.map(function(node) {
					return this._resolveNode(node);
				}, this);

				this._applyTree(cmpTree);

				this._appliedConfig = config;
			},

			_configSetter: function(config) {
				if (typeof config === 'string') {
					config = this.configs.get(config);
				}
				this._Setter('config', config);
			},

			_rootGetter: function() {
				return this._currentTree.root;
			},

			_applyTree: function(tree) {
				// empty all containers no more present in new config
				this._currentTree && this._currentTree.forEachParent(function(parent, children) {
					if (!tree.has(parent)) {
						parent.remove('content');
					}
				}.bind(this));

				tree.forEachParent(function(parent, children) {
					parent.set('content', children.map(function(child) {
						var options = tree.getAttribute(child, parent);
						return options ? [child, options] : child;
					}));
				});

				this._currentTree = tree;
				this._emit('changed');
			},

			// create components from factories if needed and store/cache them in regsitry to always use the same instance
			_resolveNode: function(arg) {
				var node;
				var registry = this._registry;
				if (typeof arg === 'string'){
					if (registry.has(arg)){
						node = registry.get(arg);
					} else {
						var factory = registry.factories.get(arg);
						if (typeof factory !== 'function'){
							throw 'No factory for this id';
						}
						node = factory();
						registry.set(arg, node);
					}
				} else {
					node = arg;
				}
				// test that node is following the domNode API
				if (node === undefined || (typeof node.get !== 'function')) {
					throw "Cannot resolve node";
				}
				return node;
			},

			_treeGetter: function() {
				return this._currentTree;
			}
		}
	);
});