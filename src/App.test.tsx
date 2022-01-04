import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders link to map', () => {
  render(<App />);
  const linkElement = screen.getByText(/Karte/i);
  expect(linkElement).toBeInTheDocument();
});
