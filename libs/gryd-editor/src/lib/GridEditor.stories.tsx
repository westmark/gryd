/* eslint-disable @typescript-eslint/no-non-null-assertion */
import styled from 'styled-components';

import { withKnobs } from '@storybook/addon-knobs';
import { GridEditor } from './GridEditor';
import { GridLayout, toGridDimension } from '@gryd/react';

export default {
  title: 'GridEditor',
  component: GridEditor,
  displayName: 'GridEditor',
  decorators: [withKnobs],
};

const GridEditorWrapper = styled.div`
  width: 600px;
  height: 500px;
`;

enum Gutters {
  first = 'first',
  middle = 'middle',
  last = 'last',
  end = 'end',
}

const simpleLayout: GridLayout = {
  mediaQueries: [
    {
      minWidth: 0,
      columns: [
        {
          id: Gutters.first,
          width: toGridDimension('1fr')!,
        },
        {
          id: Gutters.middle,
          width: toGridDimension('1fr')!,
        },
        {
          id: Gutters.last,
          width: toGridDimension('1fr')!,
        },
        {
          id: Gutters.end,
        },
      ],
      rows: [
        {
          id: Gutters.first,
          height: toGridDimension('1fr')!,
        },
        {
          id: Gutters.middle,
          height: toGridDimension('1fr')!,
        },
        {
          id: Gutters.last,
          height: toGridDimension('1fr')!,
        },
        {
          id: Gutters.end,
        },
      ],
    },
  ],
};
export const Default = () => {
  return (
    <GridEditorWrapper>
      <GridEditor layout={simpleLayout} />
    </GridEditorWrapper>
  );
};
