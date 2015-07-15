import Style from '../Style';
export default {
    load: function(name, parentRequire, onload, config) {
        parentRequire(['text!' + name], function(value) {
            onload(new Style(value));
        });
    }
};