import compose from '../utils/compose';
import _Evented from '../base/_Evented';
import DeepStore from './deep/Store';

function getChildrenOfNode(nodeKey, store) {
    var storeValue = store.value();
    var childPath = nodeKey + '/children/';
    var childPathLength = childPath.length;
    // list children
    return Object.keys(storeValue).reduce(function(acc, key) {
        if (key.substring(0, childPathLength) === childPath) {
            acc.push(key.substring(childPathLength));
        }
        return acc;
    }, []);
}

function removeNodeRecursive(nodeKey, store) {
    var storeValue = store.value();
    // list children
    var children = getChildrenOfNode(nodeKey, store);
    // delete node
    var nodePath = nodeKey;
    var nodePathLength = nodePath.length;
    for (var key in storeValue) {
        if (key.substring(0, nodePathLength) === nodePath) {
            store.change(key, undefined);
        }
    }

    var subNodes = [];
    subNodes = subNodes.concat(children);
    children.forEach(function(nodeKey) {
        subNodes = subNodes.concat(removeNodeRecursive(nodeKey, store));
    });
    return subNodes;
}

// génère une représentation d'un arbre selon la convention D3
function nodeAsTree(nodeKey, store) {
    var tree = {};
    // var node = nodes[nodeKey];
    tree.key = nodeKey;
    // tree.value = node.value; // TODO ?
    tree.children = getChildrenOfNode(nodeKey, store).map(function(nodeId) {
        return nodeAsTree(nodeId, store);
    });
    return tree;
}



// data structure where each node has one parent (excepts the root node) and 0 to n children and a deep value
export default compose(_Evented, function(initValue) {
    this._store = new DeepStore(initValue || {
        'root': true,
        'root/parent': true,
        'root/children': true,
        'root/value': true,
    });

}, {
    addChild: function(parentKey, childValue) {
        /*		var childNode = {
        			value: childValue || {},
        			parent: parentKey,
        			children: [],
        		};
        		var childNodeKey = (Math.random()*1e16).toFixed();
        		this._nodes[childNodeKey] = childNode;
        		var parentNode = this._nodes[parentKey];
        		parentNode.children.push(childNodeKey);
        */
        var childNodeKey = (Math.random() * 1e16).toFixed();
        if (childValue) {
            throw new Error('childValue is deprecated');
        }
        // create node
        this._store.change(childNodeKey, true);
        this._store.change(childNodeKey + '/parent', parentKey);
        this._store.change(childNodeKey + '/children', true);
        this._store.change(childNodeKey + '/value', true);
        // update parent node
        this._store.change(parentKey + '/children/' + childNodeKey, true);

        this._emit('treeChange', {
            addChild: {
                node: parentKey,
                child: childNodeKey,
                // value: childValue,
            },
        });
        return childNodeKey;
    },
    remove: function(nodeKey) {
        if (nodeKey === 'root') {
            return false;
        } // the root node cannot be removed
        var store = this._store;
        var parentKey = store.value()[nodeKey + '/parent'];

        // remove all subnodes
        var subNodes = removeNodeRecursive(nodeKey, store);
        // update parent node : remove ref to child node
        store.change(parentKey + '/children/' + nodeKey, undefined);

        this._emit('treeChange', {
            remove: {
                node: nodeKey,
                subNodes: subNodes,
            },
        });
        return true;
    },
    setAttr: function(nodeKey, attr, value) {
        this._store.change(nodeKey + '/value/' + attr, value);

        this._emit('change', {
            attr: {
                node: nodeKey,
                attr: attr,
                value: value,
            },
        });
    },
    onTreeChange: function(cb) {
        return this._on('treeChange', cb);
    },
    change: function(key, value) {
        return this._store.change(key, value);
    },
    onChange: function(cb) {
        return this._store.onChange(cb);
    },
    value: function() {
        return this._store.value();
    },
    valueAsTree: function() {
        // retourne un objet nesté des noeuds de l'arbre mais pas la deep valeur de chaque noeud
        return nodeAsTree('root', this._store);
    },
    keys: function() {
        // la liste des noeuds est la liste des clés de premier niveau (celles qui n'ont pas de '/')
        return Object.keys(this._store.value()).reduce(function(acc, key) {
            if (key.indexOf('/') < 0) {
                acc[key] = true;
            }
            return acc;
        }, {});
    },
});