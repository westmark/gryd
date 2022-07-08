import {
  classNames,
  getGridDimensionString,
  GridDimension,
  GridDimensionUnit,
} from '@gryd/react';
import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGridEditorContext } from './GridEditorContext';
import { convertToUnit, useMouseHover } from './gridEditorUtils';
import { OnDimensionChange } from './types';
interface GridEditorCellDimensionsProps<ID extends string = string> {
  id: ID;
  dimension: GridDimension;
  direction: 'row' | 'column';
  gridBoundingBox?: DOMRect;
  allDimensions: Array<GridDimension>;
  onDimensionChange: OnDimensionChange<ID>;
}

export const GridEditorCellDimensions = <ID extends string = string>({
  id,
  dimension,
  direction,
  gridBoundingBox,
  allDimensions,
  onDimensionChange,
}: GridEditorCellDimensionsProps<ID>) => {
  const editId = `${direction}-${id}`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { requestEditDimensionsId, editDimensionsId } = useGridEditorContext();
  const [dirty, setDirty] = useState(false);

  const [unit, setUnit] = useState<GridDimensionUnit>(dimension?.unit ?? 'px');
  const [value, setValue] = useState<GridDimension['value'] | null>(
    dimension?.value ?? 0
  );

  const [strValue, setStrValue] = useState<string>(value?.toString() ?? '');
  const [valueError, setValueError] = useState(false);

  const resetValues = useCallback(() => {
    setValue(dimension.value);
    setUnit(dimension.unit);
    setStrValue(dimension.value.toString());
    setValueError(false);
  }, [dimension.value, dimension.unit]);

  const handleMouseEnter = useCallback(() => {
    requestEditDimensionsId(editId, true, false);
  }, [editId, requestEditDimensionsId]);

  const handleMouseLeave = useCallback(() => {
    if (!dirty && !valueError && editDimensionsId === editId) {
      requestEditDimensionsId(editId, false, false);
    }
  }, [dirty, editDimensionsId, editId, requestEditDimensionsId, valueError]);

  const { setHalt, isMouseOver, ...listeners } = useMouseHover({
    leaveTimeout: 1000,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  const handleUnitChange = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const unit = event.currentTarget.getAttribute('data-unit');
      setUnit(unit as GridDimensionUnit);
      setDirty(true);
      requestEditDimensionsId(editId, true, true);
      if (dimension && unit && gridBoundingBox && allDimensions) {
        const converted = convertToUnit(
          dimension,
          unit as GridDimensionUnit,
          direction === 'row' ? gridBoundingBox.height : gridBoundingBox?.width,
          allDimensions
        );
        setValue(converted.value);
        setStrValue(converted.value.toString());
        setTimeout(() => inputRef.current?.select(), 1);
      }
    },
    [
      allDimensions,
      dimension,
      direction,
      editId,
      gridBoundingBox,
      requestEditDimensionsId,
    ]
  );

  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setStrValue(event.target.value);
      requestEditDimensionsId(editId, true, true);
      if (typeof value === 'number' && !Number.isNaN(value)) {
        setValue(value);
        setDirty(true);
        setValueError(false);
      } else {
        setValue(null);
      }
    },
    [editId, requestEditDimensionsId]
  );

  const handleCommit = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (
        value !== null &&
        event.currentTarget.getAttribute('data-action') === 'commit'
      ) {
        onDimensionChange(direction === 'row' ? { row: id } : { column: id }, {
          value,
          unit,
        });
      } else {
        resetValues();
      }
      requestEditDimensionsId(editId, true, false);
      setDirty(false);
    },
    [
      direction,
      editId,
      id,
      onDimensionChange,
      requestEditDimensionsId,
      resetValues,
      unit,
      value,
    ]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (value !== null && !valueError && event.key === 'Enter') {
        onDimensionChange(direction === 'row' ? { row: id } : { column: id }, {
          value,
          unit,
        });
        setDirty(false);
        setHalt(false);
        requestEditDimensionsId(editId, false, false);
      }
      if (value === null) {
        setValueError(true);
      }
    },
    [
      direction,
      editId,
      id,
      onDimensionChange,
      requestEditDimensionsId,
      setHalt,
      unit,
      value,
      valueError,
    ]
  );

  const handleInputFocus = useCallback(() => {
    requestEditDimensionsId(editId, true, true);
    setHalt(true);
    inputRef.current?.setSelectionRange(0, strValue.length);
  }, [editId, requestEditDimensionsId, setHalt, strValue.length]);

  const handleInputBlur = useCallback(() => {
    setHalt(false);
    if (value === null) {
      setValueError(true);
    }
    if (!dirty && !isMouseOver) {
      requestEditDimensionsId(editId, false, false);
    } else {
      requestEditDimensionsId(editId, true, dirty);
    }
  }, [dirty, editId, isMouseOver, requestEditDimensionsId, setHalt, value]);

  const expanded = editDimensionsId === editId;

  useEffect(() => {
    if (expanded) {
      resetValues();
    }
  }, [expanded, resetValues]);

  return (
    <div
      className={classNames(
        'grid-editor-cell-dimensions',
        direction,
        expanded && 'expanded'
      )}
      {...listeners}
    >
      {expanded ? (
        <>
          <input
            type="text"
            value={strValue}
            onChange={handleValueChange}
            className={classNames(
              'grid-editor-cell-dimensions__value-input',
              valueError && 'error'
            )}
            ref={inputRef}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
          />
          <div className="grid-editor-cell-dimensions__unit-picker">
            <div
              className={classNames(
                'grid-editor-cell-dimensions__unit-picker-button',
                unit === 'px' && 'selected'
              )}
              role="button"
              onClick={handleUnitChange}
              data-unit="px"
            >
              px
            </div>
            <div
              className={classNames(
                'grid-editor-cell-dimensions__unit-picker-button',
                unit === '%' && 'selected'
              )}
              role="button"
              onClick={handleUnitChange}
              data-unit="%"
            >
              %
            </div>
            <div
              className={classNames(
                'grid-editor-cell-dimensions__unit-picker-button',
                unit === 'fr' && 'selected'
              )}
              role="button"
              onClick={handleUnitChange}
              data-unit="fr"
            >
              fr
            </div>
          </div>
          <button
            className="grid-editor-cell-dimensions__commit-button"
            data-action="cancel"
            disabled={!dirty}
            onClick={handleCommit}
          >
            <X size="14" color="#EB6232" />
          </button>
          <button
            className="grid-editor-cell-dimensions__commit-button"
            data-action="commit"
            disabled={!dirty}
            onClick={handleCommit}
          >
            <Check size="14" color="#48A22A" />
          </button>
        </>
      ) : (
        getGridDimensionString(dimension)
      )}
    </div>
  );
};
