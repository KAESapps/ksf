import compose from '../../utils/compose';
import ImplicitDictComputer from '../computers/ImplicitDict';
import ImplicitDictAccessorMixin from '../accessorMixins/ImplicitDict';
var ImplicitDict = compose(function() {
    this.computer = new ImplicitDictComputer();
    this.accessorMixin = new ImplicitDictAccessorMixin().ctr;
});
export default ImplicitDict;