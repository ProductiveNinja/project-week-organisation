import { useEffect, useState } from "react";

type Alert = {
  message: string;
  type: "primary" | "danger" | "success";
};

export const useAlert = () => {
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (!alert) return;
    const timeout = setTimeout(() => {
      setAlert(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [alert]);

  return { alert, setAlert };
};

export type UseAlert = ReturnType<typeof useAlert>;
