define([], function() {
    return {
        hyphenate: function(string) {
            return string.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase();
        }
    }
});