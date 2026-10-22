import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import Home from '../page';

const nav = vi.hoisted(() => ({ params: new URLSearchParams(), push: vi.fn() }));
const queries = vi.hoisted(() => ({ useInfiniteRecordings: vi.fn() }));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: nav.push }),
    usePathname: () => '/',
    useSearchParams: () => nav.params,
}));
vi.mock('@/hooks/useQueries', () => ({
    useInfiniteRecordings: queries.useInfiniteRecordings,
}));
vi.mock('@/components/auth/AuthGuard', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/ui/RecordingCard', () => ({
    default: ({ recording }: { recording: { title: string } }) => <div data-testid="card">{recording.title}</div>,
}));

beforeEach(() => {
    nav.params = new URLSearchParams();
    nav.push.mockClear();
    queries.useInfiniteRecordings.mockReset();
    queries.useInfiniteRecordings.mockReturnValue({
        data: { pages: [{ items: [{ id: '1', title: 'Wicked' }] }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
    });
    vi.stubGlobal('IntersectionObserver', class {
        observe = vi.fn();
        disconnect = vi.fn();
    });
});

const lastTypeArg = () => queries.useInfiniteRecordings.mock.lastCall?.[1];
const segment = (name: string) => screen.getByRole('button', { name });

it('shows live recordings by default', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Latest Live Recordings' })).toBeInTheDocument();
    expect(segment('Live')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument();
    expect(lastTypeArg()).toBe('live');
    expect(screen.getByTestId('card')).toHaveTextContent('Wicked');
});

it('loads the cast album view from a deep link', () => {
    nav.params = new URLSearchParams('view=album');
    render(<Home />);

    expect(lastTypeArg()).toBe('album');
    expect(segment('Cast albums')).toHaveAttribute('aria-pressed', 'true');
    expect(segment('Live')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'Cast Albums' })).toBeInTheDocument();
});

it.each(['bogus', 'all', 'live'])('falls back to live recordings for view=%s', (view) => {
    nav.params = new URLSearchParams(`view=${view}`);
    render(<Home />);

    expect(lastTypeArg()).toBe('live');
    expect(segment('Live')).toHaveAttribute('aria-pressed', 'true');
});

it('puts cast albums in the URL and drops the param for Live', async () => {
    render(<Home />);

    await userEvent.click(segment('Cast albums'));
    expect(nav.push).toHaveBeenLastCalledWith('/?view=album', { scroll: false });

    await userEvent.click(segment('Live'));
    expect(nav.push).toHaveBeenLastCalledWith('/', { scroll: false });
});

it('switches the query and control when the URL changes on back/forward', () => {
    const { rerender } = render(<Home />);
    expect(lastTypeArg()).toBe('live');

    nav.params = new URLSearchParams('view=album');
    rerender(<Home />);
    expect(lastTypeArg()).toBe('album');
    expect(segment('Cast albums')).toHaveAttribute('aria-pressed', 'true');

    nav.params = new URLSearchParams();
    rerender(<Home />);
    expect(lastTypeArg()).toBe('live');
    expect(segment('Live')).toHaveAttribute('aria-pressed', 'true');
});

it('keeps the control visible while a view loads', () => {
    queries.useInfiniteRecordings.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
    });
    render(<Home />);

    expect(screen.getByText('Loading recordings...')).toBeInTheDocument();
    expect(screen.queryByText('No recordings found.')).not.toBeInTheDocument();
    expect(segment('Live')).toBeInTheDocument();
});
