
export function jsQuote (s) {
  let singleFlag = (s.indexOf("'") !== -1)
  let doubleFlag = (s.indexOf('"') !== -1)

  if (singleFlag && doubleFlag) {
    return `'${s.replace(/'/g, "\\'")}'`
  }

  if (singleFlag) {
    return `"${s}"`
  }

  if (doubleFlag) {
    return `'${s}'`
  }

  return `'${s}'`
}

export function pyQuote (s) {
  let singleFlag = (s.indexOf("'") !== -1)
  let doubleFlag = (s.indexOf('"') !== -1)

  if (singleFlag && doubleFlag) {
    return `'''${s}'''`
  }

  if (singleFlag) {
    return `"${s}"`
  }

  if (doubleFlag) {
    return `'${s}'`
  }

  return `'${s}'`
}
