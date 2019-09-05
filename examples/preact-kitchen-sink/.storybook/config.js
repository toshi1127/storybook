/** @jsx h */
import { configure, addParameters, addDecorator } from '@storybook/preact';
import { withA11y } from '@storybook/addon-a11y';

addDecorator(withA11y);
addParameters({
  options: {
    hierarchySeparator: /\/|\./,
    hierarchyRootSeparator: /\|/,
  },
});

configure(require.context('../src', true, /\.stories\.js$/), module);
