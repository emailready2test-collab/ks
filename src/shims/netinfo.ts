type NetInfoState = { isConnected: boolean | null };

const listeners: Array<(state: NetInfoState) => void> = [];

const NetInfo = {
  addEventListener(cb: (state: NetInfoState) => void) {
    listeners.push(cb);
    // Immediately notify as online in web build
    cb({ isConnected: true });
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },
  async fetch(): Promise<NetInfoState> {
    return { isConnected: true };
  },
};

export default NetInfo;


