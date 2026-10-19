import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import SearchPage from '../page';

const nav = vi.hoisted(() => ({ params: new URLSearchParams() }));

const recordings = vi.hoisted(() => [
    { id: '1', title: 'Wicked', recordingDate: { toMillis: () => 100 } },
    { id: '2', title: 'Cabaret', recordingDate: { toMillis: () => 300 } },
    { id: '3', title: 'Annie', recordingDate: { toMillis: () => 200 } },
]);

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: vi.fn() }),
    usePathname: () => '/search',
    useSearchParams: () => nav.params,
}));
vi.mock('@/hooks/useQueries', () => ({
    useRecordings: () => ({ data: recordings, isLoading: false }),
}));
vi.mock('@/components/ui/RecordingCard', () => ({
    default: ({ recording }: { recording: { title: string } }) => <div data-testid="card">{recording.title}</div>,
}));

const sortSelect = () => screen.getAllByRole('combobox')[1];
const cardTitles = () => screen.getAllByTestId('card').map(card => card.textContent);

it('follows the URL query on back/forward navigation', () => {
    nav.params = new URLSearchParams('q=carmen');
    const { rerender } = render(<SearchPage />);
    const input = screen.getByPlaceholderText('Search by title, artist, theatre...');
    expect(input).toHaveValue('carmen');

    nav.params = new URLSearchParams('q=boheme');
    rerender(<SearchPage />);
    expect(input).toHaveValue('boheme');
});

it('lists every recording newest first by default', () => {
    nav.params = new URLSearchParams();
    render(<SearchPage />);

    expect(sortSelect()).toHaveValue('date');
    expect(cardTitles()).toEqual(['Cabaret', 'Annie', 'Wicked']);
});

it('sorts by name when the URL asks for it', () => {
    nav.params = new URLSearchParams('sort=name');
    render(<SearchPage />);

    expect(sortSelect()).toHaveValue('name');
    expect(cardTitles()).toEqual(['Annie', 'Cabaret', 'Wicked']);
});

it('reorders when a sort is chosen', async () => {
    nav.params = new URLSearchParams();
    render(<SearchPage />);

    await userEvent.selectOptions(sortSelect(), 'name');

    expect(cardTitles()).toEqual(['Annie', 'Cabaret', 'Wicked']);
});

it('follows the URL sort on back/forward navigation', () => {
    nav.params = new URLSearchParams();
    const { rerender } = render(<SearchPage />);
    expect(sortSelect()).toHaveValue('date');

    nav.params = new URLSearchParams('sort=name');
    rerender(<SearchPage />);
    expect(sortSelect()).toHaveValue('name');
});
