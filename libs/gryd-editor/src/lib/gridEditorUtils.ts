import { GridDimension, GridDimensionUnit } from '@gryd/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const single = <T>(value: T | Array<T>): T | undefined =>
  Array.isArray(value) ? value[0] : value;

export const array = <T>(value: T | Array<T>): Array<T> | undefined => {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value : [value];
};

const isInputActive = (event: KeyboardEvent) =>
  document.activeElement?.tagName?.toLowerCase() === 'input' ||
  document.activeElement?.tagName?.toLowerCase() === 'textarea' ||
  document.activeElement?.getAttribute('contenteditable') ||
  (event.target as HTMLElement)?.tagName?.toLowerCase() === 'input' ||
  (event.target as HTMLElement)?.tagName?.toLowerCase() === 'textarea';

type HotkeyModifier = 'shiftKey' | 'ctrlKey' | 'metaKey' | 'altKey';
type HotkeyCallback = (
  hotkey: string,
  modifiers: Array<HotkeyModifier>
) => void | boolean;

export type HotkeyOptions = {
  /**
   * Callback for this hotkey combination. If the callback returns false, and only false, hotkey listeners with lower priority will not be invoked
   */
  callback: HotkeyCallback;
  hotkeys: string | Array<string>;
  modifier?: HotkeyModifier | Array<HotkeyModifier>;
  allowInputEvents?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  priority?: number;
};

const hotkeyListeners: Array<HotkeyOptions> = [];

let hotkeyMainListener: (event: KeyboardEvent) => void;

export const useHotkeys = (inOptions: HotkeyOptions) => {
  // Don't trust inOptions to be memoized, so create a memoized version
  const {
    callback,
    hotkeys,
    allowInputEvents,
    modifier,
    preventDefault,
    priority,
    stopPropagation,
  } = inOptions;
  const options = useMemo<HotkeyOptions>(
    () => ({
      callback,
      hotkeys,
      allowInputEvents,
      modifier,
      preventDefault,
      priority,
      stopPropagation,
    }),
    [
      allowInputEvents,
      callback,
      hotkeys,
      modifier,
      preventDefault,
      priority,
      stopPropagation,
    ]
  );
  useEffect(() => {
    if (!hotkeyMainListener) {
      hotkeyMainListener = (event: KeyboardEvent) => {
        const hotkey = event.key?.toLowerCase();
        if (!hotkey) {
          return;
        }
        const modifiers: Array<HotkeyModifier> = [
          event.ctrlKey && 'ctrlKey',
          event.metaKey && 'metaKey',
          event.shiftKey && 'shiftKey',
          event.altKey && 'altKey',
        ].filter(Boolean) as Array<HotkeyModifier>;

        const listeners = hotkeyListeners
          .filter((opt) => array(opt.hotkeys)?.includes(hotkey))
          .filter((opt) => {
            return (
              (opt.modifier &&
                (Array.isArray(opt.modifier)
                  ? opt.modifier.every((m) => event[m])
                  : event[opt.modifier])) ||
              (!opt.modifier && modifiers.length === 0)
            );
          })
          .filter((opt) => opt.allowInputEvents || !isInputActive(event));

        for (let i = 0; i < listeners.length; i++) {
          const opt = listeners[i];
          if (opt.preventDefault) {
            event.preventDefault();
          }
          if (opt.stopPropagation) {
            event.stopPropagation();
          }
          const result = opt?.callback?.(event.key, modifiers);
          if (result === false) {
            break;
          }
        }
      };
      document.addEventListener('keydown', hotkeyMainListener);
    }
    if (options) {
      hotkeyListeners.push({
        priority: 1,
        ...options,
        hotkeys: array(options.hotkeys)?.map((c) => c.toLowerCase()) ?? [],
      });
      hotkeyListeners.sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1));

      return () => {
        hotkeyListeners.splice(
          hotkeyListeners.findIndex((i) => i.callback === options.callback),
          1
        );
      };
    }

    return;
  }, [options]);
};

export const useMouseHover = (
  options: {
    leaveTimeout?: number;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
  } = {}
) => {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [halt, setHalt] = useState(false);
  const haltRef = useRef(halt);
  haltRef.current = halt;

  useEffect(() => {
    return () => {
      haltRef.current = true;
    };
  }, []);

  const leaveTimeoutRef = useRef<NodeJS.Timeout>();

  const onMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      if (!haltRef.current) {
        setIsMouseOver(true);
        options?.onMouseEnter?.(event);
        if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current);
          leaveTimeoutRef.current = undefined;
        }
      }
    },
    [options]
  );

  const onMouseLeave = useCallback(
    (event: React.MouseEvent) =>
      (leaveTimeoutRef.current = setTimeout(() => {
        if (!haltRef.current) {
          setIsMouseOver(false);
          options?.onMouseLeave?.(event);
        }
      }, options.leaveTimeout ?? 0)),
    [options]
  );
  const onBlur = useCallback(
    () =>
      (leaveTimeoutRef.current = setTimeout(() => {
        if (!haltRef.current) {
          setIsMouseOver(false);
        }
      }, options.leaveTimeout ?? 0)),
    [options.leaveTimeout]
  );
  const onMouseMove = useCallback(() => {
    if (!haltRef.current) {
      setIsMouseOver(true);
    }
  }, []);

  return useMemo(
    () => ({
      isMouseOver,
      onMouseEnter,
      onMouseLeave,
      onBlur,
      onMouseMove,
      setHalt,
    }),
    [isMouseOver, onBlur, onMouseEnter, onMouseLeave, onMouseMove, setHalt]
  );
};

const staticSizes: Set<GridDimensionUnit> = new Set(['px', '%']);

export const calculateNewLayout = (
  sizes: Array<GridDimension>,
  totalSizeInPx: number,
  gutterIndex: number,
  gutterDiff: number
) => {
  const sizesCopy = sizes.map((size) => ({ ...size }));

  const atLeatOneFr = sizesCopy.some((i) => i.unit === 'fr');
  const left = sizesCopy[gutterIndex];
  const right = sizesCopy[gutterIndex + 1];

  if (!left || !right) {
    console.error(
      'No left or right grid dimesion, this should not be possible'
    );
    return sizes;
  }

  const totalFraction = sizesCopy.reduce((acc, cur) => {
    if (cur.unit === 'fr') {
      return acc + cur.value;
    }
    return acc;
  }, 0);

  const totalStaticWidth = sizesCopy.reduce((acc, cur) => {
    if (staticSizes.has(cur.unit)) {
      return acc + cur.value;
    }
    return acc;
  }, 0);

  const totalFractionWidth = totalSizeInPx - totalStaticWidth;

  if (atLeatOneFr) {
    let increaseDimension: GridDimension | undefined = undefined;
    let inverted = false;
    if (left.unit === 'fr' && right.unit === 'fr') {
      increaseDimension = left;
    } else if (staticSizes.has(left.unit)) {
      increaseDimension = left;
    } else if (staticSizes.has(right.unit)) {
      increaseDimension = right;
      inverted = true;
    }

    if (increaseDimension) {
      if (increaseDimension.unit === 'fr') {
        const targetWidth =
          (totalFractionWidth / totalFraction) * increaseDimension.value;

        const oneFr =
          (totalFractionWidth - targetWidth - gutterDiff) /
          (totalFraction - increaseDimension.value);

        increaseDimension.value = (targetWidth + gutterDiff) / oneFr;
      } else {
        let targetWidth = increaseDimension.value;
        if (increaseDimension.unit === '%') {
          targetWidth = totalSizeInPx * (increaseDimension.value / 100);
        }
        const newWidth = targetWidth + gutterDiff * (inverted ? -1 : 1);
        if (increaseDimension.unit === '%') {
          increaseDimension.value = (newWidth / totalSizeInPx) * 100;
        } else {
          increaseDimension.value = newWidth;
        }
      }
    }
  }

  return sizesCopy;
};

export const getTotalStaticSize = (dims: Array<GridDimension>) =>
  dims.reduce((acc, cur) => {
    if (staticSizes.has(cur.unit)) {
      return acc + cur.value;
    }
    return acc;
  }, 0);

export const getTotalFractionSize = (dims: Array<GridDimension>) =>
  dims.reduce((acc, cur) => {
    if (cur.unit === 'fr') {
      return acc + cur.value;
    }
    return acc;
  }, 0);

export const convertToUnit = (
  from: GridDimension,
  toUnit: GridDimensionUnit,
  totalSizeInPx: number,
  dims: Array<GridDimension>
): GridDimension => {
  if (from.unit === toUnit) {
    return from;
  }
  const totalStaticSize = getTotalStaticSize(dims);
  const totalFractionSize = getTotalFractionSize(dims);

  let fromSize = from.value;
  if (from.unit === 'fr') {
    fromSize =
      ((totalSizeInPx - totalStaticSize) / totalFractionSize) * from.value;
  } else if (from.unit === '%') {
    fromSize = totalSizeInPx * (from.value / 100);
  }

  if (toUnit === 'fr') {
    const oneFr =
      (totalSizeInPx - (totalStaticSize + fromSize)) / totalFractionSize;
    return {
      unit: toUnit,
      value: fromSize / oneFr,
    };
  } else if (toUnit === '%') {
    return {
      unit: toUnit,
      value: (fromSize / totalSizeInPx) * 100,
    };
  }

  return {
    unit: toUnit,
    value: fromSize,
  };
};
