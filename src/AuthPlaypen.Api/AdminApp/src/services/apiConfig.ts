import { getBooleanConfigValue } from "./runtimeConfig";

export const apiConfig = {
  useMockData: getBooleanConfigValue("VITE_USE_MOCK_DATA"),
};
