import { useEffect, useState } from 'react';

/**
 * Devuelve `value` recién después de que pasen `delayMs` sin que cambie.
 * Se usa para no disparar un fetch al backend en cada tecla del buscador.
 */
export default function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
