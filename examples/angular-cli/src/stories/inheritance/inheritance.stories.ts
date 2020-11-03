import { IconButtonComponent } from './icon-button.component';
import { BaseButtonComponent } from './base-button.component';

export default {
  title: 'Custom/Inheritance',
};

export const IconButton = () => ({
  component: IconButtonComponent,
  props: {
    icon: 'this is icon',
    label: 'this is label',
  },
});

IconButton.storyName = 'icon button';

export const BaseButton = () => ({
  component: BaseButtonComponent,
  props: {
    label: 'this is label',
  },
});

BaseButton.storyName = 'base button';
