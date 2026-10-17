import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SearchPage from '../page';

const nav = vi.hoisted(() => ({ params: new URLSearchParams() }));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: vi.fn() }),
    usePathname: () => '/search',
    useSearchParams: () => nav.params,
}));
vi.mock('@/hooks/useQueries', () => ({
    useRecordings: () => ({ data: [], isLoading: false }),
}));

it('follows the URL query on back/forward navigation', () => {
    nav.params = new URLSearchParams('q=carmen');
    const { rerender } = render(<SearchPage />);
    const input = screen.getByPlaceholderText('Search by title, artist, theatre...');
    expect(input).toHaveValue('carmen');

    nav.params = new URLSearchParams('q=boheme');
    rerender(<SearchPage />);
    expect(input).toHaveValue('boheme');
});
