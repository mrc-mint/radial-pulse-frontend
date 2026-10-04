import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf, type QueryOf } from './types';

/** Files: listing, pre-signed upload/download and the upload helper. */
export const assetsService = {
  list: (
    api: ApiClient,
    clinicId: string,
    query: QueryOf<'/api/v1/clinics/{clinic_id}/assets', 'get'> = {},
  ) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/assets', {
        params: { ...clinicPath(clinicId), query },
      }),
    ),
  requestUpload: (
    api: ApiClient,
    clinicId: string,
    body: BodyOf<'/api/v1/clinics/{clinic_id}/assets/uploads', 'post'>,
  ) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/assets/uploads', {
        params: clinicPath(clinicId),
        body,
      }),
    ),
  confirm: (api: ApiClient, clinicId: string, assetId: string) =>
    unwrap(
      api.POST('/api/v1/clinics/{clinic_id}/assets/{asset_id}/confirm', {
        params: { path: { clinic_id: clinicId, asset_id: assetId } },
      }),
    ),
  downloadUrl: (api: ApiClient, clinicId: string, assetId: string) =>
    unwrap(
      api.GET('/api/v1/clinics/{clinic_id}/assets/{asset_id}/download-url', {
        params: { path: { clinic_id: clinicId, asset_id: assetId } },
      }),
    ),
};

/** The fetch used for object storage (pre-signed URLs); never the API client. */
export type StorageFetch = (url: string, init: RequestInit) => Promise<Response>;

/**
 * Uploads a file to the pre-signed URL returned by `assetsService.requestUpload`.
 * Goes straight to object storage, so it bypasses the API client (no bearer
 * token must be sent there); only the headers the API specified are sent.
 */
export async function uploadToPresignedUrl(
  upload: { upload_url: string; upload_headers: Record<string, unknown> },
  file: Blob,
  fetchImpl: StorageFetch = (url, init) => globalThis.fetch(url, init),
): Promise<void> {
  const headers = Object.fromEntries(
    Object.entries(upload.upload_headers).map(([k, v]) => [k, String(v)]),
  );
  const response = await fetchImpl(upload.upload_url, { method: 'PUT', headers, body: file });
  if (!response.ok) throw new Error(`Upload failed (HTTP ${response.status})`);
}

/** A file to upload, with the name the user picked it under. */
export interface UploadFile {
  data: Blob;
  name: string;
}

/**
 * The contract's three-step upload: request a pre-signed URL, PUT the file to
 * storage, then confirm (the API verifies the object). `previousVersionId`
 * makes the upload a new version of an existing file (replace).
 */
export async function uploadAsset(
  api: ApiClient,
  clinicId: string,
  input: {
    kind: BodyOf<'/api/v1/clinics/{clinic_id}/assets/uploads', 'post'>['kind'];
    file: UploadFile;
    previousVersionId?: string | null;
  },
  storageFetch?: StorageFetch,
) {
  const { data, name } = input.file;
  const upload = await assetsService.requestUpload(api, clinicId, {
    kind: input.kind,
    mime_type: data.type || 'application/octet-stream',
    size_bytes: data.size,
    original_filename: name,
    ...(input.previousVersionId ? { previous_version_id: input.previousVersionId } : {}),
  });
  await uploadToPresignedUrl(upload, data, storageFetch);
  return assetsService.confirm(api, clinicId, upload.asset.id);
}
