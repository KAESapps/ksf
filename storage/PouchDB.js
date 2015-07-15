import compose from '../utils/compose';
import clone from 'lodash-node/modern/objects/clone';
export default compose(function(name) {
    this._db = new PouchDB(name);
    this._revs = {};
}, {
    setItem: function(key, value) {
        var revs = this._revs;
        return this._db.put(value, key, revs[key]).then(function(resp) {
            revs[key] = resp.rev;
        });
    },
    removeItem: function(key) {
        var rev = this._revs[key];
        return this._db.remove(key, rev);
    },
    get: function() {
        var revs = this._revs;
        return this._db.allDocs({
            include_docs: true
        }).then(function(resp) {
            var values = {};
            resp.rows.forEach(function(row) {
                var value = row.doc;
                delete value._id;
                delete value._rev;
                values[row.id] = value;
                revs[row.id] = row.value.rev;
            });
            return values;
        });
    },
    addItems: function(itemsAsDict) {
        var revs = this._revs;
        var itemsAsArray = [];
        Object.keys(itemsAsDict).forEach(function(key) {
            var doc = clone(itemsAsDict[key]);
            doc._id = key;
            itemsAsArray.push(doc);
        });
        return this._db.bulkDocs(itemsAsArray).then(function(resp) {
            resp.forEach(function(row) {
                revs[row.id] = row.rev;
            });
        });

    }
});