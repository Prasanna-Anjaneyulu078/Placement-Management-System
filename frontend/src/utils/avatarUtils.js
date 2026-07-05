/**
 * Generates an SVG avatar with the user's initials as a data URI.
 * Replaces the need for external services like ui-avatars.com.
 *
 * @param {string} name - The user's full name
 * @param {string} bgColor - Background color (hex)
 * @param {string} textColor - Text color (hex)
 * @param {number} size - Optional size parameter for consistency, though SVG scales automatically
 * @returns {string} Data URI of the SVG avatar
 */
export const generateAvatarSVG = (name, bgColor = 'F47C20', textColor = 'ffffff', size = 256) => {
  const getInitials = (n) => {
    if (!n) return '?';
    const parts = n.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  const initials = getInitials(name);
  // Ensure hex colors have #
  const bg = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;
  const text = textColor.startsWith('#') ? textColor : `#${textColor}`;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/><text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="${text}" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
