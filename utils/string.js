define([], function() {
    return {
        hyphenate: function(string) {
            return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(' ', '-').toLowerCase();
        }
    };
});