import React, { useContext, useMemo } from 'react';

type GridEditorContextShape = {
  editDimensionsId?: string;
  requestEditDimensionsId: (
    editDimensionsId: string,
    capture: boolean,
    lock: boolean
  ) => void;
};

export const GridEditorContext = React.createContext<
  GridEditorContextShape | undefined
>(undefined);

export const useGridEditorContext = () =>
  (useContext(GridEditorContext) ?? {}) as GridEditorContextShape;

export const GridEditorContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const [editDimensions, setEditDimensionsId] = React.useState<{
    id: string | undefined;
    lock: boolean;
  }>();

  const requestEditDimensionsId = React.useCallback(
    (editDimensionsId: string, capture: boolean, lock: boolean) => {
      setEditDimensionsId((old) => {
        if (!old || old?.id === editDimensionsId || !old?.lock) {
          if (!capture) {
            return old?.id === editDimensionsId ? undefined : old;
          } else {
            return { id: editDimensionsId, lock, capture };
          }
        }
        return old;
      });
    },
    []
  );

  const value = useMemo<GridEditorContextShape>(
    () => ({
      editDimensionsId: editDimensions?.id,
      requestEditDimensionsId,
    }),
    [editDimensions, requestEditDimensionsId]
  );

  return (
    <GridEditorContext.Provider value={value}>
      {children}
    </GridEditorContext.Provider>
  );
};
