import { addDecorator } from '@storybook/react';
import React from 'react';

addDecorator((Story, context) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Story />
    </div>
  );
});
