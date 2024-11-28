import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DatabaseProvider } from '../context/DatabaseContext';
import ReportList from './ReportList';

test('renders ReportList component', () => {
  render(
    <DatabaseProvider>
      <ReportList />
    </DatabaseProvider>
  );

  expect(screen.getByText('Reports')).toBeInTheDocument();
  expect(screen.getByText('Add Report')).toBeInTheDocument();
});

test('adds a new report', async () => {
  render(
    <DatabaseProvider>
      <ReportList />
    </DatabaseProvider>
  );

  fireEvent.change(screen.getByPlaceholderText('Enter report name'), { target: { value: 'New Report' } });
  fireEvent.click(screen.getByText('Add Report'));

  expect(await screen.findByDisplayValue('New Report')).toBeInTheDocument();
});