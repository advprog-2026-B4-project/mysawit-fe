// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

afterEach(() => {
  cleanup();
});

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Index page', () => {
  it('shows the development heading and messaging', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /in development/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we are still building this space with care\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/thank you for waiting with us\./i),
    ).toBeInTheDocument();
  });

  it('renders system status link to health page', () => {
    render(<Home />);

    const statusLabel = screen.getByText(/system status/i);
    const statusLink = statusLabel.closest('a');
    expect(statusLink).toBeInTheDocument();
    expect(statusLink).toHaveAttribute('href', '/health');
  });
});
