import compose from '../../utils/compose';
var Value = compose({
    initValue: function(initValue) {
        return new Date();
    },
});
export default Value;