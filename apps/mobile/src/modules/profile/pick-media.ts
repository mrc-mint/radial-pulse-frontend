import type { UploadFile } from '@radial-pulse/api-client';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

/**
 * File pickers for the Media tab. Each returns the file as a Blob with the
 * name the user picked it under, or null when the user cancels.
 */

async function blobFrom(uri: string, file: File | undefined, type: string | null | undefined) {
  // Web builds hand over a File; native builds a local URI to read.
  if (file) return file;
  const blob = await (await fetch(uri)).blob();
  return type && !blob.type ? new Blob([blob], { type }) : blob;
}

/** A photo from the library (no camera capture in V1). */
export async function pickPhoto(): Promise<UploadFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    exif: false,
  });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  return {
    data: await blobFrom(asset.uri, asset.file, asset.mimeType),
    name: asset.fileName ?? 'photo.jpg',
  };
}

/** An audio file from the device (voice samples are uploaded, not recorded). */
export async function pickAudio(): Promise<UploadFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'audio/*',
    copyToCacheDirectory: true,
  });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  return {
    data: await blobFrom(asset.uri, asset.file, asset.mimeType),
    name: asset.name,
  };
}
