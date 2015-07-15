import compose from '../utils/compose';
import Map from '../observable/Map';
// objet qui représente une valeur distante qui change au cours du temps et qui est mise en cache localement
// à la différence de httpResource, il n'est pas possible de créer ou supprimer cette valeur, seulement la rafraichir
// TODO: faudrait-il aussi permettre de la modifier ?
export default compose(function(httpClient) {
    this._client = httpClient;
    this._fullValue = new Map();
    // ici on stocke la dernière requête qui a permi de mettre à jour 'fullValue'
    // cela permet, lorsque fullValue n'a pas encore été initialisée de mutualiser les appels a GET qui seraient fait juste pour l'initialiser
    this._lastFullValueRequest = null;
}, {
    // observable value =====================
    value: function() {
        return this._fullValue.valueOfKey('value');
    },
    onChange: function(cb) {
        return this._fullValue.onChange(function(change) {
            if ('value' in change) {
                cb(change.value);
            }
        });
    },
    // observable fullValue =================
    fullValue: function() {
        var fullValue = this._fullValue;
        return {
            value: fullValue.valueOfKey('value'),
            valueTime: fullValue.valueOfKey('valueTime'),
        };
    },
    onFullValue: function(cb) {
        var self = this;
        return this._fullValue.onChange(function() {
            cb(self.fullValue());
        });
    },
    // http methods ========================
    get: function(params, noCache) {
        var lastRequest = this._lastFullValueRequest;
        // si on force un rafraichissement ou que fullValue n'a jamais été initialisée (ou n'est pas en cours d'initilisation), on fait une requête
        if (noCache ||
            !lastRequest
        ) {
            var self = this;
            this._lastFullValueRequest = this._client(params).then(function(resp) {
                self._fullValue.change({
                    valueTime: Date.now(),
                    value: resp.entity,
                });
                return resp;
            });
            return this._lastFullValueRequest;
        } else {
            return lastRequest;
        }
    },
});