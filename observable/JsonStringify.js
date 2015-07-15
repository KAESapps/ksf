import compose from '../utils/compose';
export default compose(function(source) {
    this._source = source;
}, {
    value: function(value) {
        return JSON.stringify(this._source.value());
    },
    onChange: function(cb) {
        var self = this;
        return this._source.onChange(function(value) {
            cb(self.value());
        });
    },
});