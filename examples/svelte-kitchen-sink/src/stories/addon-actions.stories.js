import { action } from '@storybook/addon-actions';

import ButtonView from './views/ButtonView.svelte';
import Button from '../components/Button.svelte';

export default {
  title: 'Addon/Actions',
};

export const ActionOnViewMethod = () => ({
  Component: ButtonView,
  props: {
    click: action('I am logging in the actions tab'),
  },
});

ActionOnViewMethod.storyName = 'Action on view method';

export const ActionOnComponentMethod = () => ({
  Component: Button,
  props: {
    text: 'Custom text',
  },
  on: {
    click: action('I am logging in the actions tab too'),
  },
});

ActionOnComponentMethod.storyName = 'Action on component method';
