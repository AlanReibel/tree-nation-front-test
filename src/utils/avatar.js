/**
 * Generates an SVG data URI for a placeholder avatar: a circle with a
 * silhouette figure on a gray background. The SVG viewBox is always 40×40;
 * `size` controls the rendered width/height of the image element.
 *
 * @param {number} [size=40]  Rendered image size in px.
 * @returns {string}  A data:image/svg+xml URI.
 */
export function defaultAvatar(size = 40) {
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">` +
        '<rect fill="#e5e7eb" width="40" height="40" rx="20"/>' +
        '<circle fill="#9ca3af" cx="20" cy="16" r="6"/>' +
        '<path fill="#9ca3af" d="M8 34c0-6 5.5-10 12-10s12 4 12 10"/>' +
        '</svg>',
    )
  )
}

/**
 * Handles image load errors by swapping the broken src to a placeholder avatar.
 * Use as the @error handler on <img> tags.
 *
 * @param {Event} e     The error DOM event.
 * @param {number} [size=40]  Placeholder avatar size.
 */
export function onAvatarError(e, size = 40) {
  e.target.src = defaultAvatar(size)
}

/**
 * Some API profile_img values come double-wrapped:
 *   baseUrl/https%3A//baseUrl/actual-path
 * This extracts and decodes the inner URL.
 *
 * @param {string|null} url  Raw profile_img from the API.
 * @returns {string|null}    Clean URL, or the original if no wrapping.
 */
export function unwrapProfileUrl(url) {
  if (!url) return null
  const match = url.match(/https%3A\/\/([^#?]+)/i)
  if (match) {
    return decodeURIComponent(`https://${match[1]}`)
  }
  return url
}

/**
 * Formats an owner/planter object into a display name.
 *
 * @param {{ first_name?: string, last_name?: string }|null} person
 * @returns {string}
 */
export function formatPersonName(person) {
  if (!person) return 'Anonymous'
  return [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Anonymous'
}
