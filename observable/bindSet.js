export default function(set, cbs, scope) {
    scope = scope || null;
    set.value().forEach(function(key) {
        cbs.add.call(scope, key);
    });
    return set.onChange(function(changes) {
        Object.keys(changes).forEach(function(key) {
            if (changes[key] === 'add') {
                cbs.add.call(scope, key);
            }
            if (changes[key] === 'remove') {
                cbs.remove.call(scope, key);
            }
        });
    });
};