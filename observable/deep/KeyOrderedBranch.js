import compose from '../../utils/compose';
import _Evented from '../../base/_Evented';
import _Destroyable from '../../base/_Destroyable';
import sortedIndex from '../../utils/sortedIndex';

function firstPathSegment(path) {
    var slashIndex = path.indexOf('/');
    return slashIndex < 0 ? path : path.substring(0, slashIndex);
}

// étends l'API d'un Branch normal pour y ajouter la notion d'ordonnancement dans les enfants directs en fonction de la valeur d'une de leur propriété (ou plus génériquement d'un path)
export default compose(_Evented, _Destroyable, function(source, key) {
    var self = this;
    this._source = source;
    this._key = key;
    this._orderedChildrenKeys = [];

    var values = this._values = {};
    var keyLength = key.length;
    var sourceValue = source.value();
    Object.keys(sourceValue).forEach(function(sourceKey) {
        if (firstPathSegment(sourceKey) === key) {
            var relativeKey = sourceKey.substr(keyLength + 1);
            values[relativeKey] = sourceValue[sourceKey];

            // insérer l'enfant au bon endroit, s'il n'y est pas déjà
            var childKey = firstPathSegment(relativeKey);
            var childIndex = self._orderedChildrenKeys.indexOf(childKey);
            if (childIndex < 0) {
                var childInsertIndex = sortedIndex(self._orderedChildrenKeys, childKey);
                self._orderedChildrenKeys.splice(childInsertIndex, 0, childKey);
            }
        }
    });

    this._own(source.onChange(function(change) {
      if (firstPathSegment(change.key) === key) {
        var relativeKey = change.key.substr(keyLength + 1);
        var childKey = firstPathSegment(relativeKey);
        var childIndex, childInsertIndex;

        if (change.value === undefined) {
          // dans le cas d'une suppression, si après la suppression dans le cache, il n'y a plus de clé qui commence par le premier segment, on émet 'keyRemoved'
          delete values[relativeKey];
          if (!self._hasKey(childKey)) {
              childIndex = self._orderedChildrenKeys.indexOf(childKey);
              self._orderedChildrenKeys.splice(childIndex, 1);
              self._emit('keyRemoved', {
                  key: childKey,
              });
          }
        } else {
          // dans le cas de l'ajout/update, si avant la mise à jour du cache, il n'y a pas encore de clé qui commence par le premier segment, on émet 'keyAdded'
          if (!self.hasKey(childKey)) {
              values[relativeKey] = change.value;

              childInsertIndex = sortedIndex(self._orderedChildrenKeys, childKey);
              self._orderedChildrenKeys.splice(childInsertIndex, 0, childKey);
              var beforeKey = self._orderedChildrenKeys[childInsertIndex + 1];

              self._emit('keyAdded', {
                  key: childKey,
                  beforeKey: beforeKey,
              });
          } else {
              values[relativeKey] = change.value;
          }
        }
        self._emit('change', {
          key: relativeKey,
          value: change.value,
        });

      }
    }));
}, {
    hasKey: function(key) {
        return this.keys().indexOf(key) >= 0;
    },
    // c'est la version non performante utilisée en interne pour mettre à jour le cache utilisé en public
    _hasKey: function(key) {
        return Object.keys(this._values).some(function(valueKey) {
            return firstPathSegment(valueKey) === key;
        });
    },
    keys: function() {
        return this._orderedChildrenKeys;
    },
    change: function(key, value) {
        return this._source.change(this._key + '/' + key, value);
    },
    onChange: function(cb) {
        return this._on('change', cb);
    },
    onKeyAdded: function(cb) {
        // appeler le cb dès qu'une clé est ajoutée (passe à non undefined)
        return this._on('keyAdded', cb);
    },
    onKeyRemoved: function(cb) {
        // appeler le cb dès qu'une clé est enlevée (passe à undefined)
        return this._on('keyRemoved', cb);
    },
    value: function() {
        return this._values;
    },
    addKey: function(key) {
        // ajoute au moins une entrée qui permet d'être sûr que la clé est créée. Par défaut, c'est la valeur 'true'
        key = key || (Math.random() * 1e16).toFixed();
        this.change(key, true);
        return key;
    },
    removeKey: function(key) {
        // supprime toutes les clés qui ont comme premier segment 'key', pour être sûr que ça déclenche l'événement 'keyRemoved'
        var self = this;
        Object.keys(this._values).forEach(function(path) {
            if (firstPathSegment(path) === key) {
                self.change(path, undefined);
            }
        });
    },
});
