import React, { useContext, useMemo } from 'react';

type GridEditorContextShape = {
  editCellId?: string;
  requestEditCellId: (editCellId?: string) => void;
};

export const GridEditorContext = React.createContext<
  GridEditorContextShape | undefined
>(undefined);

export const useGridEditorContext = () =>
  (useContext(GridEditorContext) ?? {}) as GridEditorContextShape;

export const GridEditorContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const [editCellId, setEditCellId] = React.useState<string | undefined>();

  const requestEditCellId = React.useCallback((id: string | undefined) => {
    setEditCellId(id);
  }, []);

  const value = useMemo<GridEditorContextShape>(
    () => ({
      editCellId,
      requestEditCellId,
    }),
    [editCellId, requestEditCellId]
  );

  return (
    <GridEditorContext.Provider value={value}>
      {children}
    </GridEditorContext.Provider>
  );
};
