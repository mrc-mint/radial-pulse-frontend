import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Small, non-sensitive device preferences (never tokens, never clinic data):
 * the last selected clinic and whether the Connect step was dismissed.
 * Failures are ignored: these only save the person a tap.
 */
const key = {
  selectedClinic: (userId: string) => `rp.selected-clinic.${userId}`,
  connectDismissed: (userId: string) => `rp.connect-dismissed.${userId}`,
};

async function read(k: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(k);
  } catch {
    return null;
  }
}

function write(k: string, value: string) {
  AsyncStorage.setItem(k, value).catch(() => {});
}

export const deviceStorage = {
  getSelectedClinic: (userId: string) => read(key.selectedClinic(userId)),
  setSelectedClinic: (userId: string, clinicId: string) =>
    write(key.selectedClinic(userId), clinicId),
  getConnectDismissed: async (userId: string) =>
    (await read(key.connectDismissed(userId))) === 'true',
  setConnectDismissed: (userId: string) => write(key.connectDismissed(userId), 'true'),
};
