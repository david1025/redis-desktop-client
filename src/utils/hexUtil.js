export function buffer2String (buf) {
  if (typeof buf === 'string') {
    return buf
  }

  if (bufVisible(buf)) {
    return buf.toString()
  }

  return bufToHex(buf)
}

function bufVisible (buf) {
  return buf.equals(Buffer.from(buf.toString()))
}

function bufToHex (buf) {
  const result = buf.toJSON().data.map(item => {
    if (item >= 32 && item <= 126) {
      return String.fromCharCode(item)
    }
    let hex16Str = item.toString(16)
    if (hex16Str.length === 1) {
      hex16Str = '0' + hex16Str
    }
    return '\\x' + hex16Str.toUpperCase()
  })

  return result.join('')
}
