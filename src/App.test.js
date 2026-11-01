import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Zainussunna intro title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Zainussunna/i);
  expect(titleElement).toBeInTheDocument();
});

