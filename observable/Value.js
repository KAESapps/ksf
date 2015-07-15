import StatefulFactory from './StatefulFactory';
import ValueModel from './model/Value';
export default new StatefulFactory(new ValueModel()).ctr;