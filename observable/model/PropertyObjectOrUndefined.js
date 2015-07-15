import compose from '../../utils/compose';
import PropertyObjectComputer from '../computers/PropertyObjectOrUndefined';
import PropertyObjectAccessorMixin from '../accessorMixins/PropertyObjectOrUndefined';
var PropertyObject = compose(function(properties, computedProperties, Computer) {
    this._properties = properties;
    this._computedProperties = computedProperties;
    var computers = {},
        accessorMixins = {},
        computedAccessorMixins = {};
    Object.keys(properties).forEach(function(prop) {
        computers[prop] = properties[prop].computer;
        accessorMixins[prop] = properties[prop].accessorMixin;
    });
    // les computed properties ne fournissent pas de computer mais seulement un accessorMixin
    computedProperties && Object.keys(computedProperties).forEach(function(prop) {
        computedAccessorMixins[prop] = computedProperties[prop].accessorMixin;
    });
    if (Computer) { // le computer est injectable
        this.computer = new Computer(computers);
    } else {
        this.computer = new PropertyObjectComputer(computers);
    }
    this.accessorMixin = new PropertyObjectAccessorMixin(accessorMixins, computedAccessorMixins).ctr;
});
export default PropertyObject;