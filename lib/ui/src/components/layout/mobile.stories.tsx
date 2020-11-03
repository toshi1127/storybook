/* eslint-disable react/destructuring-assignment */
import React, { Fragment } from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ActiveTabs } from '@storybook/api';
import { DecoratorFn } from '@storybook/react';

import { Mobile, MobileProps } from './mobile';

import { mockProps, realProps, MockPage } from './app.mockdata';

export default {
  title: 'UI/Layout/Mobile',
  component: Mobile,
  parameters: { passArgsFirst: false },
  decorators: [
    withKnobs,
    ((storyFn, c) => {
      const mocked = boolean('mock', true);

      const props = {
        ...(mocked ? mockProps : realProps),
      };

      return storyFn({ props, ...c });
    }) as DecoratorFn,
  ],
};

export const InitialSidebar = ({ props }: { props: MobileProps }) => (
  <Mobile {...props} options={{ ...props.options, initialActive: ActiveTabs.SIDEBAR }} />
);
export const InitialCanvas = ({ props }: { props: MobileProps }) => (
  <Mobile {...props} options={{ ...props.options, initialActive: ActiveTabs.CANVAS }} />
);
export const InitialAddons = ({ props }: { props: MobileProps }) => (
  <Mobile {...props} options={{ ...props.options, initialActive: ActiveTabs.ADDONS }} />
);
export const Page = ({ props }: { props: MobileProps }) => (
  <Mobile
    {...props}
    options={{ ...props.options, initialActive: ActiveTabs.CANVAS }}
    pages={[
      {
        key: 'settings',
        route: ({ children }) => <Fragment>{children}</Fragment>,
        render: () => <MockPage />,
      },
    ]}
    viewMode="settings"
  />
);
