import '@testing-library/jest-dom';

// Mock crypto.getRandomValues for deterministic testing where needed
// The global crypto is available via jsdom but may need polyfill
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: <T extends ArrayBufferView>(array: T): T => {
        if (array instanceof Uint8Array) {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
        } else if (array instanceof Uint32Array) {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 0xFFFFFFFF);
          }
        }
        return array;
      },
    },
  });
}
