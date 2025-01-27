import { createContext } from "react";
import { UseAlert } from "../hooks/useAlert";

export const AlertContext = createContext<UseAlert>({} as UseAlert);
