import React, { useState } from 'react';
import { ObjectControl } from './Object';

export default {
  title: 'Controls/Object',
  component: ObjectControl,
};

const Template = (initialValue: any) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <ObjectControl name="object" value={value} onChange={(newVal) => setValue(newVal)} />
      <p>{value && JSON.stringify(value)}</p>
    </>
  );
};

export const Basic = () => Template({ name: 'Michael', nested: { something: true } });

export const Null = () => Template(null);

export const Undefined = () => Template(undefined);

export const ValidatedAsArray = () => {
  const [value, setValue] = useState([]);
  return (
    <>
      <ObjectControl
        name="object"
        argType={{ type: { name: 'array' } }}
        value={value}
        onChange={(newVal) => setValue(newVal)}
      />
      <p>{value && JSON.stringify(value)}</p>
    </>
  );
};
