var callOn = function(instance, arg) {
    if (typeof arg === 'function') {
        arg.call(instance);
    } else {
        for (var key in arg) {
            instance[key](arg[key]);
        }
    }
    return instance;
};
export default callOn;