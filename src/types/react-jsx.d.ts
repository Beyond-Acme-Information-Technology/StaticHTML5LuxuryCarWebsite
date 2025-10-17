declare module 'react';
declare module 'react/jsx-runtime';

// Minimal JSX intrinsic elements to satisfy the TypeScript checker in this repo snapshot.
declare namespace JSX {
  interface IntrinsicElements {
    // allow any html element with any props
    [elemName: string]: any;
  }
}

declare namespace React {
  interface MutableRefObject<T> {
    readonly current: T;
  }
}
