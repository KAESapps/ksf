export default function(set, cbs, scope) {
    scope = scope || null;
    set.value().forEach(function(key) {
        cbs.add.call(scope, key);
    });
    return set.onChange(function(changes) {
        changes.forEach(function(change) {
            if (change.type === 'add') {
                cbs.add.call(scope, change.key, change.beforeKey);
            }
            if (change.type === 'remove') {
                cbs.remove.call(scope, change.key);
            }
            if (change.type === 'move') {
                // TODO: si cbs.move n'est pas fourni, remplacer par un appel à 'remove' puis à 'add' ?
                cbs.move.call(scope, change.key, change.beforeKey);
            }
        });
    });
};