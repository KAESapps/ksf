
define([
	'intern!object',	'intern/chai!assert',
	'dojo/_base/declare',
	'../AttributeTree'
], function(
	registerSuite,		assert,
	declare,
	AttributeTree
) {
	"strict mode";

	var tree, root, rootAttr, sub1, sub1Attr, sub2, subSub1, subSub1Attr, subSub2;

	registerSuite({
		name: "Tree of attributed nodes",
		beforeEach: function() {
			// declared outside of owner as a convenience for tests
			root = {name: "root"};
			rootAttr = {name: "rootAttr"};
			sub1 = {name: "sub1"};
			sub1Attr = {$: "sub1Attr"};
			sub2 = {name: "sub2"};
			subSub1 = {name: "subSub1"};
			subSub1Attr = {};
			subSub2 = {$: "subSub2"};

			tree = new AttributeTree();
			tree.set(sub1, root, sub1Attr);
			tree.set(sub2, root);
			tree.set(subSub1, sub1, subSub1Attr);
		},


		"create an empty tree": function  () {
			tree = new AttributeTree();
			assert(tree.root === undefined);
		},

		"create a tree with one value": function  () {
			tree = new AttributeTree(root);
			assert(tree.has(root));
			assert(tree.root === root);
		},

		"using api": function() {
			assert.equal(tree.getAttribute(sub1, root), sub1Attr, "sub1 attributes retrievable");
			assert.deepEqual(tree.getChildren(root), [sub1, sub2], "can get children of root");
			assert.deepEqual(tree.getParents(sub1), [root], "can get parents of node");
			assert.equal(tree.getAttribute(subSub1, sub1), subSub1Attr, "subSub1 attributes retrievable");
		},

		"create from literal one level": function(){
			var tree = new AttributeTree([root, [
				sub1,
				sub2,
			]]);
			assert(tree.root === root);
			assert(tree.has(root));
			assert.deepEqual(tree.getChildren(root), [sub1, sub2]);
		},

		"create from literal 2 levels": function(){
			var tree = new AttributeTree([root, [
				[sub1, [
					subSub1,
					subSub2,
				]],
				sub2,
			]]);
			assert(tree.root === root);
			assert(tree.has(root));
			assert(tree.has(sub1));
			assert(tree.has(sub2));
			assert.deepEqual(tree.getChildren(root), [sub1, sub2]);
			assert.deepEqual(tree.getParents(sub1), [root]);
			assert.deepEqual(tree.getParents(sub2), [root]);
			assert.deepEqual(tree.getChildren(sub1), [subSub1, subSub2]);
			assert.deepEqual(tree.getParents(subSub1), [sub1]);
			assert.deepEqual(tree.getParents(subSub2), [sub1]);
		},

		"create from literal one level with value": function(){
			var tree = new AttributeTree([root, [
				[sub1, sub1Attr],
			]]);
			assert(tree.root === root);
			assert(tree.has(root));
			assert(tree.has(sub1));
			assert(tree.length === 2);
			assert.deepEqual(tree.getChildren(root), [sub1]);
			assert.deepEqual(tree.getParents(sub1), [root]);
			assert(tree.getAttribute(sub1, root) === sub1Attr);
		},

		"create from literal 2 levels with values": function(){
			var tree = new AttributeTree([root, [
				[[sub1, sub1Attr], [
					[subSub1, subSub1Attr],
					subSub2,
				]],
				sub2,
			]]);
			assert(tree.root === root);
			assert(tree.has(root));
			assert(tree.has(sub1));
			assert(tree.has(sub2));
			assert(tree.length === 5);
			assert.deepEqual(tree.getChildren(root), [sub1, sub2]);
			assert.deepEqual(tree.getParents(sub1), [root]);
			assert.deepEqual(tree.getParents(sub2), [root]);
			assert.deepEqual(tree.getChildren(sub1), [subSub1, subSub2]);
			assert.deepEqual(tree.getParents(subSub1), [sub1]);
			assert.deepEqual(tree.getParents(subSub2), [sub1]);
			assert(tree.getAttribute(sub1, root) === sub1Attr);
			assert(tree.getAttribute(subSub1, sub1) === subSub1Attr);
			assert(tree.getAttribute(sub2, root) === undefined);
		},

		"many parents": function() {
			var sub1Sub1Attr = {},
				sub2Sub1Attr = {};
			var tree = new AttributeTree([root, [
				[[sub1, sub1Attr], [
					[subSub1, sub1Sub1Attr],
					subSub2
				]],
				[sub2, [
					[subSub1, sub2Sub1Attr]
				]],
			]]);

			assert(tree.root === root);
			assert(tree.has(root));
			assert(tree.has(sub1));
			assert(tree.has(sub2));
			assert(tree.length === 5);
			assert.deepEqual(tree.getChildren(root), [sub1, sub2]);
			assert.deepEqual(tree.getParents(sub1), [root]);
			assert.deepEqual(tree.getParents(sub2), [root]);
			assert.deepEqual(tree.getChildren(sub1), [subSub1, subSub2]);
			assert.deepEqual(tree.getParents(subSub1), [sub1, sub2]);
			assert.deepEqual(tree.getParents(subSub2), [sub1]);
			assert(tree.getAttribute(sub1, root) === sub1Attr);
			assert(tree.getAttribute(subSub1, sub1) === sub1Sub1Attr);
			assert(tree.getAttribute(subSub1, sub2) === sub2Sub1Attr);
			assert(tree.getAttribute(sub2, root) === undefined);
		},

		forEach: function() {
			var tree = new AttributeTree([root, [
				[[sub1, sub1Attr], [
					[subSub1, subSub1Attr],
					subSub2,
				]],
				sub2,
			]]);
			var nodes = [];
			var parents = [];
			var attrs = [];
			tree.forEach(function(node, parent, attr){
				nodes.push(node);
				parents.push(parent);
				attrs.push(attr);
			});
			assert.deepEqual(nodes, [root, sub1, subSub1, subSub2, sub2]);
			assert.deepEqual(parents, [undefined, root, sub1, sub1, root]);
			assert.deepEqual(attrs, [undefined, sub1Attr, subSub1Attr, undefined, undefined]);
		},

		map: function() {
			window.map = tree.map(function(node){
				return node.name;
			});
		},

		toLiteral: function() {
			var literal = [root, [
				[[sub1, sub1Attr], [
					[subSub1, subSub1Attr],
					subSub2,
				]],
				sub2,
			]];
			var tree = new AttributeTree(literal);
			
			assert.deepEqual(tree.toLiteral(), literal);
		}
	});
});
