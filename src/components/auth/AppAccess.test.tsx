import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import AppAccess from './AppAccess';
import { useAuth } from '@/hooks/useAuth';

const navigation = vi.hoisted(() => ({ pathname: '/', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
    usePathname: () => navigation.pathname,
    useRouter: () => ({ replace: navigation.replace }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
const mockAuth = vi.mocked(useAuth);
const user = { uid: 'viewer', email: 'viewer@example.com', displayName: 'Viewer', photoURL: null, role: 'viewer' as const };

beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue({ user: null, loading: false, authError: null });
});

it.each(['/', '/search', '/recordings/example', '/admin', '/future-route', '/login/other'])(
    'does not mount protected content at %s when signed out', (pathname) => {
        navigation.pathname = pathname;
        const mounted = vi.fn();
        function PrivatePage() { mounted(); return <div>Private catalogue</div>; }
        render(<AppAccess><PrivatePage /></AppAccess>);
        expect(mounted).not.toHaveBeenCalled();
        expect(navigation.replace).toHaveBeenCalledWith('/login');
    },
);

it('keeps login accessible without redirecting', () => {
    navigation.pathname = '/login';
    render(<AppAccess><div>Sign in</div></AppAccess>);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
});

it('does not show protected content before the allowlist check completes', () => {
    navigation.pathname = '/search';
    mockAuth.mockReturnValue({ user, loading: true, authError: null });
    render(<AppAccess><div>Private catalogue</div></AppAccess>);
    expect(screen.queryByText('Private catalogue')).not.toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
});

it('allows viewers and removes content on sign-out', () => {
    navigation.pathname = '/search';
    mockAuth.mockReturnValue({ user, loading: false, authError: null });
    const { rerender } = render(<AppAccess><div>Private catalogue</div></AppAccess>);
    expect(screen.getByText('Private catalogue')).toBeInTheDocument();
    mockAuth.mockReturnValue({ user: null, loading: false, authError: null });
    rerender(<AppAccess><div>Private catalogue</div></AppAccess>);
    expect(screen.queryByText('Private catalogue')).not.toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith('/login');
});

it('uses a fresh query cache after sign-out and sign-in', async () => {
    const { useQueryClient } = await import('@tanstack/react-query');
    const clients: ReturnType<typeof useQueryClient>[] = [];
    function Probe() {
        clients.push(useQueryClient());
        return <div>Private catalogue</div>;
    }
    navigation.pathname = '/search';
    mockAuth.mockReturnValue({ user, loading: false, authError: null });
    const { rerender } = render(<AppAccess><Probe /></AppAccess>);
    clients[0].setQueryData(['recordings'], ['previous session']);
    mockAuth.mockReturnValue({ user: null, loading: false, authError: null });
    rerender(<AppAccess><Probe /></AppAccess>);
    mockAuth.mockReturnValue({ user, loading: false, authError: null });
    rerender(<AppAccess><Probe /></AppAccess>);
    expect(clients.at(-1)).not.toBe(clients[0]);
    expect(clients.at(-1)?.getQueryData(['recordings'])).toBeUndefined();
});
