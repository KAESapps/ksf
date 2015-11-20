import on from '../utils/on'

export default function(value, cb, scope) {
  if (scope) {
    cb = cb.bind(scope)
  }
  cb(value.value())
  return on(value, 'change', cb)
};
