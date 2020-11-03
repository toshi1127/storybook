import React, { useContext, FunctionComponent } from 'react';
import { Title as PureTitle } from '@storybook/components';
import { DocsContext, DocsContextProps } from './DocsContext';

interface TitleProps {
  children?: JSX.Element | string;
}
export const extractTitle = ({ kind, parameters }: DocsContextProps) => {
  const groups = kind.split('/');

  return (groups && groups[groups.length - 1]) || kind;
};

export const Title: FunctionComponent<TitleProps> = ({ children }) => {
  const context = useContext(DocsContext);
  let text: JSX.Element | string = children;
  if (!text) {
    text = extractTitle(context);
  }
  return text ? <PureTitle className="sbdocs-title">{text}</PureTitle> : null;
};
