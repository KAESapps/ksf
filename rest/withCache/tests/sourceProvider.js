import Deferred from 'dojo/Deferred';
var data = {
    1: {
        id: "1",
        nom: "Site 1",
        surface: "12.8"
    },
    2: {
        id: "2",
        nom: "Site 2",
        surface: "44"
    },
    3: {
        id: "3",
        nom: "Site 3",
        surface: "13.5"
    },
};
var sourceProvider = {
    item: function(id) {
        return {
            get: function() {
                var deferred = new Deferred();
                deferred.resolve(data[id]);
                return deferred;
            }
        };
    },
    query: function(params) {
        return {
            get: function() {
                var deferred = new Deferred();
                deferred.resolve(Object.keys(data).map(function(key) {
                    return data[key];
                }));
                return deferred;
            },
        };
    },
};

export default sourceProvider;