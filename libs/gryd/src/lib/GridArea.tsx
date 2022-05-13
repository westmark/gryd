import { ForwardedRef, forwardRef, PropsWithChildren, useMemo } from 'react';
import { GridAreaDefinition } from './types';
import { classNames, makeGridAreaStyle } from './utils';

interface GridAreaProps<ID extends string = string> {
  area: GridAreaDefinition<ID>;
  className?: string;
  style?: React.CSSProperties;
}

const GridAreaInner = <ID extends string = string>(
  { area, className, style, children }: PropsWithChildren<GridAreaProps<ID>>,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const finalStyle = useMemo(
    () => ({
      ...makeGridAreaStyle(area),
      ...(style ?? {}),
    }),
    [area, style]
  );
  return (
    <div
      style={finalStyle}
      className={classNames('grid-area-wrapper', className)}
    >
      {children}
    </div>
  );
};

export const GridArea = forwardRef(GridAreaInner);
