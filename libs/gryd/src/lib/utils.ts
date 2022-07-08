/* eslint-disable @typescript-eslint/no-explicit-any */
import { CSSProperties } from 'react';
import {
  GridDimension,
  GridDimensionUnit,
  GridMediaQueryLayout,
} from './types';

export const getMatchedMediaQuery = <ID extends string = string>(
  mediaQueries: Array<GridMediaQueryLayout<ID>>
) => {
  const matched = mediaQueries.filter((mediaQueryLayout) =>
    window.matchMedia(`(min-width: ${mediaQueryLayout.minWidth}px)`)
  );

  return matched.reduce<GridMediaQueryLayout<ID> | null>(
    (best, current) =>
      current.minWidth > (best?.minWidth ?? -1) ? current : best,
    null
  );
};

export const makeGridAreaStyle = <ID extends string = string>(
  area: Array<ID | number>
): CSSProperties => ({
  gridArea: area.join(' / '),
});

export const classNames = (
  ...classnames: Array<string | undefined | null | boolean | number>
): string => {
  /*!
    Copyright (c) 2018 Jed Watson.
    Licensed under the MIT License (MIT), see
    http://jedwatson.github.io/classnames

    Minor modifications by westmark@github
  */
  const classes = [];
  const hasOwn = {}.hasOwnProperty;

  for (let i = 0; i < classnames.length; i++) {
    const arg = classnames[i];
    if (!arg) continue;

    const argType = typeof arg;

    if (argType === 'string' || argType === 'number') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = classNames(...arg);
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (argType === 'object') {
      if (arg.toString !== Object.prototype.toString) {
        classes.push(arg.toString());
      } else {
        for (const key in arg as any) {
          if (hasOwn.call(arg, key) && (arg as any)[key]) {
            classes.push(key);
          }
        }
      }
    }
  }

  return classes.join(' ');
};

export const getGridDimensionString = (
  dim: GridDimension | string | undefined,
  digits?: number
): string => {
  if (!dim) {
    return '0';
  }

  if (isGridDimension(dim)) {
    const finalDigits = digits ?? (dim.unit === 'px' ? 0 : 2);
    const value = Math.round(dim.value * 10 ** finalDigits) / 10 ** finalDigits;
    return `${value}${dim.unit}`;
  }

  return dim;
};

export const toGridDimension = (
  dim: string | GridDimension | undefined | null
): GridDimension | null => {
  if (isGridDimension(dim)) {
    return dim;
  }

  const match = dim?.match(/^(\d+)(px|%|fr)$/);
  if (match) {
    return {
      unit: match[2] as GridDimensionUnit,
      value: parseInt(match[1], 10),
    };
  }

  return null;
};

export const isGridDimension = (o: unknown): o is GridDimension =>
  Boolean(o && typeof o === 'object' && 'unit' in o && 'value' in o);
