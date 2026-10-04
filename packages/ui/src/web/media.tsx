import { useState, type MouseEvent, type ReactNode } from 'react';
import './media.css';
import { cx } from './internal';

/**
 * Protected media viewers: show a clinic photo or play a voice sample without
 * the casual browser download routes (no link, no download attribute, no
 * context menu, no drag-out, no visible URL).
 *
 * This only deters casual saving: anyone allowed to view a file can still
 * capture it. Real protection is the API's authorization and short-lived,
 * private storage URLs. Components receive the URL; they never fetch it.
 */

const block = (event: MouseEvent) => event.preventDefault();

export interface ProtectedImageProps {
  /** A short-lived URL from the API; undefined while it loads. */
  src: string | undefined;
  alt: string;
  /** `cover` fills a tile; `contain` shows the whole photo (review viewer). */
  fit?: 'cover' | 'contain';
  /** Shown while there is no image (loading, missing or failed). */
  placeholder?: ReactNode;
  className?: string;
}

export function ProtectedImage({
  src,
  alt,
  fit = 'cover',
  placeholder,
  className,
}: ProtectedImageProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const show = Boolean(src) && failed !== src;
  return (
    <div
      className={cx('rp-protected-image', `rp-protected-image--${fit}`, className)}
      onContextMenu={block}
      onDragStart={block}
    >
      {show ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(src ?? null)}
        />
      ) : (
        <div className="rp-protected-image__placeholder" role="img" aria-label={alt}>
          {placeholder}
        </div>
      )}
    </div>
  );
}

export interface ProtectedAudioProps {
  /** A short-lived URL from the API; undefined while it loads. */
  src: string | undefined;
  /** Accessible name, e.g. the sample's title. */
  label: string;
  className?: string;
}

export function ProtectedAudio({ src, label, className }: ProtectedAudioProps) {
  if (!src) {
    return (
      <div className={cx('rp-protected-audio', 'rp-protected-audio--empty', className)}>
        Loading audio…
      </div>
    );
  }
  return (
    <audio
      className={cx('rp-protected-audio', className)}
      src={src}
      controls
      // Chromium hides its own download item; other browsers ignore this.
      controlsList="nodownload noplaybackrate"
      preload="metadata"
      aria-label={label}
      onContextMenu={block}
    />
  );
}
