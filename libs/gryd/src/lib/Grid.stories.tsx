/* eslint-disable @typescript-eslint/no-non-null-assertion */
import styled from 'styled-components';

import { withKnobs } from '@storybook/addon-knobs';
import { Grid } from './Grid';
import { GridLayout } from './types';
import { GridArea } from './GridArea';
import { toGridDimension } from './utils';

export default {
  title: 'Grid',
  component: Grid,
  displayName: 'Grid',
  decorators: [withKnobs],
};

const WrappedGrid = styled(Grid)`
  border: 1px solid #ccc;
  width: 500px;
  height: 500px;
`;

const StyledGridArea = styled(GridArea)`
  background-color: yellow;
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
          width: toGridDimension('100px')!,
        },
        {
          id: Gutters.middle,
          width: toGridDimension('1fr')!,
        },
        {
          id: Gutters.last,
          width: toGridDimension('50px')!,
        },
        {
          id: Gutters.end,
        },
      ],
      rows: [
        {
          id: Gutters.first,
          height: toGridDimension('100px')!,
        },
        {
          id: Gutters.middle,
          height: toGridDimension('1fr')!,
        },
        {
          id: Gutters.last,
          height: toGridDimension('50px')!,
        },
        {
          id: Gutters.end,
        },
      ],
    },
  ],
};

export const DefaultGrid = () => {
  return (
    <WrappedGrid layout={simpleLayout}>
      <div
        style={{
          gridArea: 'first / first / middle / middle',
          backgroundColor: 'yellow',
        }}
      >
        First - middle
      </div>
    </WrappedGrid>
  );
};

export const SingleGridArea = () => {
  return (
    <WrappedGrid layout={simpleLayout}>
      <StyledGridArea
        area={[Gutters.first, Gutters.middle, Gutters.end, Gutters.last]}
      >
        Full middle
      </StyledGridArea>
    </WrappedGrid>
  );
};

const getContent = () => (
  <div
    style={{ color: 'red', backgroundColor: 'lightsteelblue', height: '100%' }}
  >
    Some red content
  </div>
);

export const SingleGridAreaWithContent = () => {
  return (
    <WrappedGrid
      layout={simpleLayout}
      cells={[
        {
          id: 1,
          area: [Gutters.first, Gutters.middle, Gutters.end, Gutters.last],
          content: getContent,
        },
      ]}
    />
  );
};
