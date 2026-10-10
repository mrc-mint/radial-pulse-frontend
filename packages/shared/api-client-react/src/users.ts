import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService, type BodyOf, type QueryOf } from '@radial-pulse/api-client';
import { useApiClient } from './provider';
import { platformQueryKey } from './query-keys';

/** Radial Pulse staff accounts. */

export function useUsers(
  query: QueryOf<'/api/v1/users', 'get'>,
  options: { enabled?: boolean } = {},
) {
  const api = useApiClient();
  return useQuery({
    queryKey: platformQueryKey('users', query),
    queryFn: () => usersService.list(api, query),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useCreateUser() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyOf<'/api/v1/users', 'post'>) => usersService.create(api, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: platformQueryKey('users') }),
  });
}

export function useResendInvite() {
  const api = useApiClient();
  return useMutation({ mutationFn: (userId: string) => usersService.resendInvite(api, userId) });
}
