import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewComponent from './NewComponent';

test('renders New Component', () => {
  render(<NewComponent />);
  expect(screen.getByText('New Component')).toBeInTheDocument();
  expect(screen.getByText('This is a new component.')).toBeInTheDocument();
});