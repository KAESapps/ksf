var compose = function(base) {
    var contructors = [];
    var prototypes = [];
    var trait;

    for (var i = 0; i < arguments.length; i++) {
        trait = arguments[i];
        if (typeof arguments[i] === 'function') {
            contructors.push(trait);
            i > 0 && prototypes.push(trait.prototype);
        } else {
            i > 0 && prototypes.push(trait);
        }
    }

    var traits = arguments;
    var Ctr = function() {
        for (var i = 0; i < traits.length; i++) {
            trait = traits[i];
            typeof trait === 'function' && trait.apply(this, arguments);
        }
    };
    Ctr.prototype = Object.create((typeof base === 'function') ? base.prototype : base);
    // don't mix base properties as they are inherited
    var trait;
    for (var i = 1; i < traits.length; i++) {
        trait = traits[i];
        var props = (typeof trait === 'function') ? trait.prototype : trait;
        for (var key in props) {
            Ctr.prototype[key] = props[key];
        }
    }
    return Ctr;
};
export default compose;