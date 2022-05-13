/* eslint-disable @typescript-eslint/no-explicit-any */
import update from 'immutability-helper';
import {
  getMatchedMediaQuery,
  Grid,
  GridCell,
  GridLayout,
  GridMediaQueryLayout,
} from '@gryd/react';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GridEditorCellControlContainer } from './GridEditorCellControlContainer';
import { GridEditorContextProvider } from './GridEditorContext';
import './styles.css';

interface GridEditorProps<ID extends string = string, C = any> {
  layout: GridLayout<ID>;
  cells?: Array<GridCell<ID, C>>;
}

export const GridEditor = <ID extends string = string, C = any>({
  layout: initialLayout,
  cells,
}: PropsWithChildren<GridEditorProps<ID, C>>) => {
  const [layout, setLayout] = useState(initialLayout);
  const [mediaQueryLayout, setMediaQueryLayout] = useState(
    useMemo(
      () => getMatchedMediaQuery(layout.mediaQueries),
      [layout.mediaQueries]
    )
  );

  const gridRef = useRef<HTMLDivElement>(null);
  const [gridBoundingBox, setGridBoundingBox] = useState<DOMRect>();

  useEffect(() => {
    const boundingBox = gridRef.current?.getBoundingClientRect();
    setGridBoundingBox(boundingBox);
  }, []);

  const handleMediaQueryLayoutChange = useCallback(
    (mediaQueryLayout: GridMediaQueryLayout<ID>) => {
      setLayout((old) => {
        const index = old.mediaQueries.findIndex(
          (m) => m.minWidth === mediaQueryLayout.minWidth
        );

        if (index >= 0) {
          setMediaQueryLayout(mediaQueryLayout);
          return update(old, {
            mediaQueries: {
              [index]: {
                $set: mediaQueryLayout,
              },
            },
          });
        }

        return old;
      });
    },
    []
  );

  return (
    <GridEditorContextProvider>
      <div className="grid-editor-wrapper">
        <Grid layout={layout} cells={cells} ref={gridRef}>
          {mediaQueryLayout ? (
            <GridEditorCellControlContainer
              mediaQueryLayout={mediaQueryLayout}
              gridBoundingBox={gridBoundingBox}
              onMediaQueryChange={handleMediaQueryLayoutChange}
            />
          ) : null}
        </Grid>
      </div>
    </GridEditorContextProvider>
  );
};
