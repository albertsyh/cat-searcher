import { useEffect, useCallback } from "react";

const useDebounce = (effect, dependencies, delay, token) => {
  // store the provided effect in a `useCallback` hook to avoid
  // having the callback function execute on each render
  const callback = useCallback(effect, dependencies); // eslint-disable-line

  // wrap our callback function in a `setTimeout` function
  // and clear the tim out when completed
  useEffect(
    () => {
      const timeout = setTimeout(callback, delay);
      return () => {
        clearTimeout(timeout);
        token?.cancel();
      };
    },
    // re-execute  the effect if the delay or callback changes
    [callback, delay] // eslint-disable-line
  );
};

export { useDebounce };
