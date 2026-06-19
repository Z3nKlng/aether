import { getApiClient } from '@aether/api-client';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export const useApi = () => {
  const { data: session } = useSession();
  
  const client = useMemo(() => {
    // @ts-ignore - session.accessToken is added by our custom auth config
    return getApiClient(session?.accessToken);
  }, [session]);

  return client;
};
