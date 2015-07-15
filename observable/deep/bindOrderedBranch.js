export default function(orderedBranch, cbs) {
    var storage = {}; // permet aux cbs de renvoyer une valeur pour la stocker
    var add = cbs.add && function(ev) {
        var ret = cbs.add(ev.key, ev.beforeKey);
        storage[ev.key] = ret;
    };
    var remove = cbs.remove && function(ev) {
        var key = ev.key;
        cbs.remove(key, storage[key]);
        delete storage[key];
    };
    var move = cbs.move && function(ev) {
        cbs.move(ev.key, ev.beforeKey);
    };

    if (cbs.init) {
        // permet d'avoir une logique d'initialisation différente de la logique incrémentale
        // je ne sais pas si c'est très utile...
        cbs.init(orderedBranch.keys());
    } else {
        add && orderedBranch.keys().map(function(key) {
            return {
                key: key,
                beforeKey: null
            };
        }).forEach(add);
    }
    var keyAddedHandler = add && orderedBranch.onKeyAdded(add);
    var keyRemovedHandler = remove && orderedBranch.onKeyRemoved(remove);
    var keyMovedHandler = move && orderedBranch.onKeyMoved(move);

    return function() {
        keyAddedHandler && keyAddedHandler();
        keyRemovedHandler && keyRemovedHandler();
        keyMovedHandler && keyMovedHandler();
    };
};