export default function(value, cb, scope) {
  if (scope) {
    cb.call(scope, value.value());
    return value.onChange(cb.bind(scope));
  } else {
    cb(value.value());
    return value.onChange(cb);
  }
};
