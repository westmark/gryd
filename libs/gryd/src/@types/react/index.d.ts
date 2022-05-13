/* eslint-disable @typescript-eslint/ban-types */
// eslint-disable-next-line react/no-typos
import 'react';

declare module 'react' {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}
