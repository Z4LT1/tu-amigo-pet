"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true solo en el cliente; evita diferencias de hidratación con estado guardado en localStorage. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
