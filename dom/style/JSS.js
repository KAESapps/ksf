import compose from '../../utils/compose';
import Style from './Style';
import Absurd from '../../absurd/Absurd';
/*
	Define style from a JS object (using AbsurdJS)
 */
export default compose(Style.prototype, function(jss) {
    var css;
    Absurd().add({
        '#this': jss
    }).compile(function(err, result) {
        css = result;
    });
    Style.call(this, css);
});