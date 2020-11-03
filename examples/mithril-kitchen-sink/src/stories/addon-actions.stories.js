/** @jsx m */

import m from 'mithril';
import { action, actions } from '@storybook/addon-actions';
import Button from '../Button';

export default {
  title: 'Addons/Actions',
};

export const Story1 = () => ({
  view: () => <Button onclick={action('logo1')}>Click me to log the action</Button>,
});
Story1.storyName = 'Action only';

export const Story2 = () => ({
  view: () => (
    <Button {...actions('onclick', 'ondblclick')}>(Double) click me to log the action</Button>
  ),
});
Story2.storyName = 'Multiple actions';

export const Story3 = () => ({
  view: () => (
    <Button {...actions({ onclick: 'clicked', ondblclick: 'double clicked' })}>
      (Double) click me to log the action
    </Button>
  ),
});
Story3.storyName = 'Multiple actions, object';

export const Story4 = () => ({
  view: () => (
    <Button
      onclick={(e) => {
        e.preventDefault();
        action('log2')(e.target);
      }}
    >
      Click me to log the action
    </Button>
  ),
});
Story4.storyName = 'Action and method';
