export default {
    hyphenate: function(string) {
        return typeof string === 'string' && string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(' ', '-').toLowerCase();
    }
};