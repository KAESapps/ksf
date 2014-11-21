define([
	'../utils/compose',
	'../base/_Evented',
],function(
	compose,
	_Evented
) {

function removeNodeRecursive (nodeKey, nodes) {
	var children = nodes[nodeKey].children;
	delete nodes[nodeKey];
	var subNodes = [];
	subNodes = subNodes.concat(children);
	children.forEach(function(nodeKey) {
		subNodes = subNodes.concat(removeNodeRecursive(nodeKey, nodes));
	});
	return subNodes;
}

// génère une représentation d'un arbre selon la convention D3
function nodeAsTree (nodeKey, nodes) {
	var tree = {};
	var node = nodes[nodeKey];
	tree.key = nodeKey;
	tree.value = node.value;
	if (node.children) {
		tree.children = node.children.map(function(nodeId) {
			return nodeAsTree(nodeId, nodes);
		});
	}
	return tree;
}



// data structure where each node has one parent (excepts the root node) and 0 to n children and a bag of attribute values (indexed by key)
return compose(_Evented, function(initValue) {
	this._nodes = initValue || {
		root: {
			value: {},
			parent: null,
			children: [],
		},
	};

}, {
	addChild: function(parentKey, childValue) {
		var childNode = {
			value: childValue || {},
			parent: parentKey,
			children: [],
		};
		var childNodeKey = (Math.random()*1e16).toFixed();
		this._nodes[childNodeKey] = childNode;
		var parentNode = this._nodes[parentKey];
		parentNode.children.push(childNodeKey);
		this._emit('change', {
			addChild: {
				node: parentKey,
				child: childNodeKey,
				value: childValue,
			},
		});
		return childNodeKey;
	},
	remove: function(nodeKey) {
		if (nodeKey === 'root') { return false; } // the root node cannot be removed
		var nodes = this._nodes;
		var subNodes = removeNodeRecursive(nodeKey, nodes);
		// update parent node
		Object.keys(this._nodes).some(function(parentNodeKey) {
			var foundIndex = nodes[parentNodeKey].children ? nodes[parentNodeKey].children.indexOf(nodeKey) : -1;
			if (foundIndex >= 0) {
				nodes[parentNodeKey].children.splice(foundIndex, 1);
				return true;
			}
			return false;
		});
		this._emit('change', {
			remove: {
				node: nodeKey,
				subNodes: subNodes,
			},
		});
		return true;
	},
	setAttr: function(nodeKey, attr, value) {
		this._nodes[nodeKey].value[attr] = value;
		this._emit('change', {
			attr: {
				node: nodeKey,
				attr: attr,
				value: value,
			},
		});
	},
	onChange: function(cb) {
		return this._on('change', cb);
	},
	value: function() {
		return this._nodes;
	},
	valueAsTree: function() {
		return nodeAsTree('root', this._nodes);
	},
});

});