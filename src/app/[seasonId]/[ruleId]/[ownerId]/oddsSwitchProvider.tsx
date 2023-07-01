"use client";

import { ReactNode, createContext, useContext, useState } from "react";

const OddsSwitchContext = createContext({
  toggle: () => {},
  isShowTotalPoint: true,
});

export const useOddsSwitch = () => useContext(OddsSwitchContext);

export const OddsSwitchProvider = ({ children }: { children: ReactNode }) => {
  const [isShowTotalPoint, setShowTotoalPoint] = useState(true);
  const toggle = () => {
    setShowTotoalPoint(!isShowTotalPoint);
  };

  return (
    <OddsSwitchContext.Provider value={{ toggle, isShowTotalPoint }}>
      {children}
    </OddsSwitchContext.Provider>
  );
};
