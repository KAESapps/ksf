define([
	'ksf/utils/constructor',
	'collections/map',	'collections/set'
], function(
	constructor,
	Map,				Set
) {
	function isLiteralTree(item) {
		return Array.isArray(item) && item.length === 2 && Array.isArray(item[1]);
	}

	function isAttributedNode(item) {
		return Array.isArray(item) && item.length === 2 && !Array.isArray(item[1]);
	}

	var parseLiteralTree = function(tree, callback, root) {
		var node, options;
		if (isLiteralTree(tree)) {
			node = tree[0];
			if (isAttributedNode(node)) {
				options = node[1];
				node = node[0];
			}
			callback(node, root, options);

			tree[1].forEach(function(child){
				parseLiteralTree(child, callback, node);
			});
		} else if (tree instanceof Tree) {
			tree.forEach(function(node, parent, options) {
				callback(node, parent || root, options);
			});
		} else {
			node = tree;
			if (isAttributedNode(node)) {
				options = node[1];
				node = node[0];
			}
			callback(node, root, options);
		}
	};

	/*
	 * Tree with attributed nodes
	 */
	var Tree = constructor(function Tree (tree) {
			// register parents -> children + attributes relations
			this._topDown = new Map();
			this._bottomUp = new Map();

			if (tree !== undefined){
				if (isLiteralTree(tree)){
					parseLiteralTree(tree, function(node, parent, attr){
						parent && this.set(node, parent, attr);
					}.bind(this));
				} else if (tree instanceof Tree){
					this.addTree(tree);
				} else {
					this.set(tree);
				}
			}
		}, {

		/*
		 * Add node with attribute in tree as a child of parent
		 */
		set: function(child, parent, attr) {
			if (parent) {
				var parents = this._bottomUp.get(child);
				if (!parents) {
					parents = new Set();
					this._bottomUp.set(child, parents);
				}
				parents.add(parent);

				if (!this._root) {
					this._root = parent;
				}
				var children = this._topDown.get(parent);
				if (!children) {
					children = new Map();
					this._topDown.set(parent, children);
				}
				children.set(child, attr);
			} else {
				this._root = child;
			}
		},

		get root() {
			return this._root;
		},
		isLeaf: function(node) {
			return !this._topDown.has(node);
		},

		/*
		 * Remove node from tree
		 */
		remove: function(child, parent) {
			if (parent) {
				var children = this._topDown.get(parent);
				if (children) {
					children.delete(child);
					if (!children.length) {
						this._topDown.delete(parent);
					}
				}

				var parents = this._bottomUp.get(child);
				parents && parents.delete(parent);
				if (!parents.length) {
					this._bottomUp.delete(child);
				}
			} else {
				this._root = undefined;
			}
		},

		getChildren: function(parent) {
			var children = this._topDown.get(parent);
			return children && children.keys() || new Set();
		},

		getParents: function(child) {
			var parents = this._bottomUp.get(child);
			return parents && parents.toArray();
		},

		get length() {
			return this._bottomUp.length + (this._root ? 1 : 0);
		},

		/*
		 * For each node of the tree call callback(node, parent, attr) following a top down order
		 */
		forEach: function(callback, scope) {
			var tree = this;
			function processNode(node, cb, parent){
				cb.call(scope, node, parent, tree.getAttribute(node, parent));
				!tree.isLeaf(node) && tree.getChildren(node).forEach(function(child){
					processNode(child, cb, node);
				});
			}
			if (this._root) {
				processNode(this._root, callback);
			}
		},

		/**
		 * Execute a callback for each parent and their children, bottom-up
		 * @param  {Function} cb    Callback
		 * @param  {Object}   scope Scope of callback
		 */
		forEachParent: function(cb, scope) {
			var bottomUp = function(tree, root, cb) {
				var children = tree.getChildren(root);
				children.forEach(function(child) {
					if (!tree.isLeaf(child)) {
						bottomUp(tree, child, cb);
					}
				});
				cb.call(scope, root, children);
			};
			bottomUp(this, this.root, cb);
		},

		topDown: function(cb, root) {
			root = root || this.root;
			cb(root);
			var children = this.getChildren(root);
			children.forEach(function(child) {
				this.topDown(cb, child);
			}.bind(this));
		},

		bottomUp: function(cb, root) {
			root = root || this.root;
			var children = this.getChildren(root);
			children.forEach(function(child) {
				if (this.isLeaf(child)) {
					cb(child);
				} else {
					this.bottomUp(cb, child);
				}
			}.bind(this));
			cb(root);
		},

		getAttribute: function(child, parent) {
			return parent && this._topDown.get(parent).get(child);
		},
		has: function(node) {
			return this._topDown.has(node) || this._bottomUp.has(node) || this._root === node;
		},
		addTree: function(tree, attachNode){
			tree.forEach(function(node, parent, attr){
				this.set(node, parent || attachNode, attr);
			}.bind(this));
		},
		map: function(cb, scope) {
			var clone = new Tree();
			var mapping = new Map();
			this.forEach(function(node, parent, attr){
				mapping.set(node, cb.call(scope, node));
				clone.set(mapping.get(node), mapping.get(parent), attr);
			});
			return clone;
		},
		toLiteral: function(node, parent) {
			var literal;
			node = node || this.root;

			var attr = this.getAttribute(node, parent);
			if (attr) {
				literal = [node, attr];
			} else {
				literal = node;
			}

			var children = this.getChildren(node);
			if (children) {
				literal = [literal, children.map(function(child) {
					return this.toLiteral(child, node);
				}.bind(this))];
			}
			return literal;
		}

	});

	return Tree;
});
