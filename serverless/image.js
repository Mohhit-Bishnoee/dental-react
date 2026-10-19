const MAX_IMAGE_SIZE = 3 * 1024 * 1024
const IMAGE_TYPES = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matches: (data) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  'image/webp': {
    extension: 'webp',
    matches: (data) => data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP',
  },
}

export function parseUploadedImage(type, encodedData) {
  if (
    typeof type !== 'string' ||
    !IMAGE_TYPES[type] ||
    typeof encodedData !== 'string' ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encodedData)
  ) return null

  const data = Buffer.from(encodedData, 'base64')
  const imageType = IMAGE_TYPES[type]
  if (
    !data.length ||
    data.length > MAX_IMAGE_SIZE ||
    data.toString('base64') !== encodedData ||
    !imageType.matches(data)
  ) return null

  return { data, extension: imageType.extension }
}
