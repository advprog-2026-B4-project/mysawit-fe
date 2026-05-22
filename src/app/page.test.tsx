
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

afterEach(() => {
  cleanup();
});

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

describe('Index page', () => {
  it('redirects to /login', () => {
    expect(() => Home()).toThrow('NEXT_REDIRECT:/login');
  });

  it('redirects immediately without rendering content', () => {
    let threw = false;
    try {
      Home();
    } catch (e) {
      threw = true;
      expect((e as Error).message).toBe('NEXT_REDIRECT:/login');
    }
    expect(threw).toBe(true);
  });
});