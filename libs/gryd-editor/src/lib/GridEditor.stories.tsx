import styled from 'styled-components';

import { withKnobs } from '@storybook/addon-knobs';
import { GridEditor } from './GridEditor';
import { GridLayout } from '@gryd/react';

export default {
  title: 'GridEditor',
  component: GridEditor,
  displayName: 'GridEditor',
  decorators: [withKnobs],
};

const GridEditorWrapper = styled.div`
  width: 500px;
  height: 500px;
`;

enum Gutters {
  first = 'first',
  middle = 'middle',
  last = 'last',
  end = 'end',
}

const simpleLayout: GridLayout<Gutters> = {
  mediaQueries: [
    {
      minWidth: 0,
      columns: [
        {
          id: Gutters.first,
          width: '1fr',
        },
        {
          id: Gutters.middle,
          width: '1fr',
        },
        {
          id: Gutters.last,
          width: '1fr',
        },
        {
          id: Gutters.end,
        },
      ],
      rows: [
        {
          id: Gutters.first,
          height: '1fr',
        },
        {
          id: Gutters.middle,
          height: '1fr',
        },
        {
          id: Gutters.last,
          height: '1fr',
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
