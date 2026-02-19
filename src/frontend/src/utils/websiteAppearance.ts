import type { Logo, BackgroundSetting } from '../backend';

/**
 * Get the logo source URL from a Logo object
 * Returns the default logo path as fallback
 */
export function getLogoSrc(logo: Logo): string {
  const defaultLogo = '/assets/generated/cupcakesmp-logo-transparent.dim_200x200.png';
  
  if (logo.__kind__ === 'url') {
    return logo.url.trim() || defaultLogo;
  } else if (logo.__kind__ === 'blob') {
    try {
      return logo.blob.getDirectURL();
    } catch (error) {
      console.error('Error getting blob URL:', error);
      return defaultLogo;
    }
  }
  
  return defaultLogo;
}

/**
 * Get CSS style object for background from BackgroundSetting
 */
export function getBackgroundStyle(backgroundSetting: BackgroundSetting): React.CSSProperties {
  if (backgroundSetting.__kind__ === 'color') {
    return {
      backgroundColor: backgroundSetting.color.value || '#1a1a1a',
    };
  } else if (backgroundSetting.__kind__ === 'image') {
    const imageUrl = backgroundSetting.image.value.trim();
    if (imageUrl) {
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
  }
  
  return {};
}

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}
