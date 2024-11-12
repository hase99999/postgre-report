import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportProvider } from '../context/ReportContext';
import ReportList from '../components/ReportList';
import { server } from './server';

// frontend/src/mocks/server.test.js

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios).
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

test('renders ReportList component with mocked data', async () => {
    render(
        <ReportProvider>
            <ReportList />
        </ReportProvider>
    );

    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Add Report')).toBeInTheDocument();

    // Check if the mocked reports are rendered
    expect(await screen.findByText('Report 1')).toBeInTheDocument();
    expect(await screen.findByText('Report 2')).toBeInTheDocument();
    expect(await screen.findByText('Report 3')).toBeInTheDocument();
});

test('handles server error', async () => {
    server.use(
        rest.get('/reports', (req, res, ctx) => {
            return res(ctx.status(500));
        })
    );

    render(
        <ReportProvider>
            <ReportList />
        </ReportProvider>
    );

    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Add Report')).toBeInTheDocument();

    // Check if the error message is displayed
    expect(await screen.findByText('Failed to load reports')).toBeInTheDocument();
});