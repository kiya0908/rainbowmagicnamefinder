import { createContext, useContext } from "react";

interface ThirdPartyServicesState {
  advertisingEnabled: boolean;
  analyticsEnabled: boolean;
}

const ThirdPartyServicesContext = createContext<ThirdPartyServicesState>({
  advertisingEnabled: false,
  analyticsEnabled: false,
});

export const ThirdPartyServicesProvider = ThirdPartyServicesContext.Provider;
export const useThirdPartyServices = () => useContext(ThirdPartyServicesContext);
