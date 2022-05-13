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
        minHeight: '90vh',
      }}
    >
      <Story />
    </div>
  );
});
