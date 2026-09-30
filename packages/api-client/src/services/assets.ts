import { unwrap, type ApiClient } from '../http';
import { clinicPath, type BodyOf } from './types';

/** Files: pre-signed upload/download and the upload helper. */
export const assetsService = {
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

/**
 * Uploads a file to the pre-signed URL returned by `assetsService.requestUpload`.
 * Goes straight to object storage, so it bypasses the API client (no bearer
 * token must be sent there); only the headers the API specified are sent.
 */
export async function uploadToPresignedUrl(
  upload: { upload_url: string; upload_headers: Record<string, unknown> },
  file: Blob,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<void> {
  const headers = Object.fromEntries(
    Object.entries(upload.upload_headers).map(([k, v]) => [k, String(v)]),
  );
  const response = await fetchImpl(upload.upload_url, { method: 'PUT', headers, body: file });
  if (!response.ok) throw new Error(`Upload failed (HTTP ${response.status})`);
}
