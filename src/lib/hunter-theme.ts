import { useEffect, useState } from "react";

const KEY = "hunter-light-mode";

export function useHunterLight() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(window.localStorage.getItem(KEY) === "1");
  }, []);

  const toggle = () =>
    setLight((prev) => {
      const next = !prev;
      window.localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });

  return { light, toggle };
}
