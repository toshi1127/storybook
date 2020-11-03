import { withKnobs, text, color } from '@storybook/addon-knobs';
import { OnPushBoxComponent } from './on-push-box.component';

export default {
  title: 'Core/OnPush',
  decorators: [withKnobs],
};

export const ClassSpecifiedComponentWithOnPushAndKnobs = () => ({
  component: OnPushBoxComponent,
  props: {
    word: text('Word', 'OnPush'),
    bgColor: color('Box color', '#FFF000'),
  },
});

ClassSpecifiedComponentWithOnPushAndKnobs.storyName =
  'Class-specified component with OnPush and Knobs';
