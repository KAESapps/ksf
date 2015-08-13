export default function(value, cb, scope) {
  if (scope) {
    cb = cb.bind(scope)
  }
  cb(value.value())
  value.onChange(cb)
  return function () {
    value.offChange(cb)
  }
};
