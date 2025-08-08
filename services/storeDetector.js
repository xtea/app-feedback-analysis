/**
 * Detects app store type (apple/google) and normalizes appId from a user-provided input.
 * Supported inputs:
 * - Apple numeric ID: "284882215"
 * - Apple URL: "https://apps.apple.com/us/app/id284882215"
 * - Google package: "com.facebook.katana"
 * - Google URL: "https://play.google.com/store/apps/details?id=com.facebook.katana"
 *
 * Returns: { appId: string, storeType: 'apple' | 'google', reason: string }
 */
function detectStoreFromInput(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return null;
  }

  const input = rawInput.trim();

  // Try URL patterns first
  if (input.startsWith('http://') || input.startsWith('https://')) {
    try {
      const url = new URL(input);
      const hostname = url.hostname.toLowerCase();

      // Google Play URL: id param holds package
      if (hostname.includes('play.google.com')) {
        const pkg = url.searchParams.get('id');
        if (isValidAndroidPackage(pkg)) {
          return { appId: pkg, storeType: 'google', reason: 'google_url' };
        }
      }

      // Apple App Store URL: contains path segment like id284882215
      if (hostname.includes('apps.apple.com')) {
        const match = url.pathname.match(/id(\d{5,})/i);
        if (match && match[1]) {
          return { appId: match[1], storeType: 'apple', reason: 'apple_url' };
        }
      }
    } catch {
      // fall through to non-URL heuristics
    }
  }

  // Pure numeric -> Apple ID
  if (/^\d{5,}$/.test(input)) {
    return { appId: input, storeType: 'apple', reason: 'numeric_id' };
  }

  // Android package name heuristic
  if (isValidAndroidPackage(input)) {
    return { appId: input, storeType: 'google', reason: 'android_package' };
  }

  // Fallbacks: try to extract from common raw strings
  const appleIdMatch = input.match(/id(\d{5,})/i);
  if (appleIdMatch && appleIdMatch[1]) {
    return { appId: appleIdMatch[1], storeType: 'apple', reason: 'apple_id_in_text' };
  }

  // Unknown
  return null;
}

function isValidAndroidPackage(str) {
  if (!str) return false;
  // Basic Java package name pattern: segments separated by dots, starting with a letter
  // Allowed chars per segment: letters, digits, underscore
  // Require at least two segments
  return /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(str);
}

module.exports = {
  detectStoreFromInput,
};


