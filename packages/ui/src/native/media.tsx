import { useState, type ReactNode } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { t } from './theme';

/**
 * Protected image viewer: shows a clinic photo from a short-lived URL with no
 * save or share affordance (React Native images have no long-press save by
 * default). Deters casual saving only; real protection is the API's
 * authorization and short-lived, private storage URLs. Receives the URL;
 * never fetches it.
 */
export interface ProtectedImageProps {
  /** A short-lived URL from the API; undefined while it loads. */
  src: string | undefined;
  alt: string;
  /** `cover` fills a tile; `contain` shows the whole photo. */
  fit?: 'cover' | 'contain';
  /** Shown while there is no image (loading, missing or failed). */
  placeholder?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const SVG_DATA_URL = /^data:image\/svg\+xml(;base64)?,/;

/** SVG `data:` URLs (sample images) are drawn with react-native-svg. */
function svgFromDataUrl(src: string): string | null {
  const match = SVG_DATA_URL.exec(src);
  if (!match) return null;
  const body = src.slice(match[0].length);
  try {
    return match[1] ? atob(body) : decodeURIComponent(body);
  } catch {
    return null;
  }
}

export function ProtectedImage({
  src,
  alt,
  fit = 'cover',
  placeholder,
  style,
}: ProtectedImageProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const show = Boolean(src) && failed !== src;
  const svg = show && src ? svgFromDataUrl(src) : null;
  return (
    <View
      style={[styles.frame, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={alt}
    >
      {svg ? (
        <SvgXml
          xml={svg}
          width="100%"
          height="100%"
          preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
        />
      ) : show && src ? (
        <Image
          source={{ uri: src, cache: 'reload' }}
          resizeMode={fit}
          style={StyleSheet.absoluteFill}
          onError={() => setFailed(src)}
        />
      ) : (
        <View style={styles.placeholder}>{placeholder}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: t.color.bg.subtle,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
