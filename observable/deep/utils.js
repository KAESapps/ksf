import reduce from 'lodash/collection/reduce'

/**
tranform from
{name: 'toto',
address: {
  street: 'ma rue',
  city: 'Paris'
}}
to
{
'/name': 'toto',
'/name/address/street': 'ma rue',
'/name/address/city': "Paris",
}
*/
export function json2kv(data, acc, path) {
  var path = path || ''
  return reduce(data, function (acc, value, key) {
    var childPath = path+'/'+key
    if (typeof value === 'object' && !Array.isArray(value)) {
      //acc[childPath] = true
      return json2kv(value, acc, childPath)
    } else {
      acc[childPath] = value
    }
    return acc
  }, acc || {})
}

export function kv2json(flat) {
  return Object.keys(flat).reduce(function (out, path) {
    var value = flat[path]
    var segments = path.split('/').slice(1)
    segments.reduce(function (obj, segment, segmentIndex) {
      if (segmentIndex === segments.length-1) {
        obj[segment] = value
      } else {
        if (!obj[segment]) {
          obj[segment] = {}
        }
        return obj[segment]
      }
    }, out)
    return out
  }, {})
}
