export default {
    chain: function() {
        this[arguments[0]].apply(this, Array.prototype.slice.call(arguments, 1));
        return this;
    }
};