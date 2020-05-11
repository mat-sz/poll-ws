const nameCharacterSet = 'CEFGHJKMNPQRTVWXY';
const nameLength = 5;

export function generateShortId() {
  return new Array(nameLength)
    .fill('')
    .map(() =>
      nameCharacterSet.charAt(
        Math.floor(Math.random() * nameCharacterSet.length)
      )
    )
    .join('');
}
