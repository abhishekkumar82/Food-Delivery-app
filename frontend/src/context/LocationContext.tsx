import { createContext, useContext, useState, ReactNode } from "react";

type LocationCtx = { city: string; setCity: (c: string) => void };

const Ctx = createContext<LocationCtx>({ city: "London", setCity: () => {} });

// Shared "deliver to" city, used by the navbar selector and the homepage.
export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCityState] = useState(
    () => localStorage.getItem("deliverCity") || "London"
  );
  const setCity = (c: string) => {
    setCityState(c);
    localStorage.setItem("deliverCity", c);
  };
  return <Ctx.Provider value={{ city, setCity }}>{children}</Ctx.Provider>;
};

export const useLocationCity = () => useContext(Ctx);
