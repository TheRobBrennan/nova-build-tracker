export const getWsConnected = (): boolean => true;

export const subscribeToWsState = (
  _onConnect: () => void,
  _onDisconnect: () => void,
): (() => void) => {
  return () => {};
};
