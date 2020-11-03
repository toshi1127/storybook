import { addParameters, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

addDecorator(withKnobs);
addParameters({
  options: {
    brandTitle: 'CRA TypeScript Kitchen Sink',
    brandUrl: 'https://github.com/storybookjs/storybook/tree/master/examples/cra-ts-kitchen-sink',
  },
});
