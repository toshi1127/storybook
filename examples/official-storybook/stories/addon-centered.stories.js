import React from 'react';
import centered from '@storybook/addon-centered/react';

import BaseButton from '../components/BaseButton';

export default {
  title: 'Addons|Centered',
  decorators: [centered],
};

export const story1 = () => <BaseButton label="This story should be centered" />;

story1.story = {
  name: 'story 1',
};

export const story2 = () => <BaseButton label="This story should not be centered" />;

story2.story = {
  name: 'story 2 not centered',

  parameters: {
    centered: { disable: true },
  },
};
