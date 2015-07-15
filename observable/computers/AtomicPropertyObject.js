import compose from '../../utils/compose';
/**
Le principe d'un atomic property object est que sur change, une nouvelle valeur est initialisée sans tenir compte de la valeur précédente
*/
var PropertyObject = compose(function(properties) {
    this._properties = properties;
}, {
    initValue: function(initArg) {
        initArg = initArg || {};
        var value = {};
        var properties = this._properties;
        Object.keys(properties).forEach(function(key) {
            var property = properties[key];
            value[key] = property.initValue(initArg[key]);
        });
        return value;
    },
    computeValue: function(changeArg, initValue) {
        return this.initValue(changeArg);
    },
    computeChangeArg: function(changeArg, initValue) {
        var outChangeArg = {};
        var properties = this._properties;
        Object.keys(properties).forEach(function(key) {
            var property = properties[key];
            if (property.computeChangeArg) {
                outChangeArg[key] = property.computeChangeArg(changeArg[key], initValue[key]); // faut-il tenir compte de initValue ?
            }
        });
        return outChangeArg;
    },
});
export default PropertyObject;