import { act, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { User } from 'firebase/auth';
import { AuthProvider, useAuthContext } from '../AuthContext';

const mocks = vi.hoisted(() => ({ getDoc: vi.fn(), subscribe: vi.fn() }));
vi.mock('@/firebase/auth', () => ({ onAuthChange: mocks.subscribe }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), getDoc: mocks.getDoc }));
let authChanged: (user: Partial<User> | null) => Promise<void>;
const viewer = { uid: 'viewer', email: 'viewer@example.com', emailVerified: true };

function Status() {
    const { user, loading, authError } = useAuthContext();
    return <div>{loading ? 'Checking' : user ? user.uid : 'Denied'}{authError}</div>;
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockImplementation((callback) => { authChanged = callback; return vi.fn(); });
});

it('does not restore a signed-out user when an old allowlist request completes', async () => {
    let finishLookup: (value: unknown) => void = () => {};
    mocks.getDoc.mockReturnValue(new Promise(resolve => { finishLookup = resolve; }));
    render(<AuthProvider><Status /></AuthProvider>);
    let pending: Promise<void> = Promise.resolve();
    act(() => { pending = authChanged(viewer); });
    await act(async () => { await authChanged(null); });
    expect(screen.getByText('Denied')).toBeInTheDocument();
    await act(async () => {
        finishLookup({ exists: () => true, data: () => ({ role: 'viewer' }) });
        await pending;
    });
    expect(screen.getByText('Denied')).toBeInTheDocument();
});

it.each(['viewer', 'editor', 'admin'])('accepts an allowlisted %s', async (role) => {
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role }) });
    render(<AuthProvider><Status /></AuthProvider>);
    await act(async () => { await authChanged(viewer); });
    expect(screen.getByText('viewer')).toBeInTheDocument();
});

it('rejects an invalid role', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'owner' }) });
    render(<AuthProvider><Status /></AuthProvider>);
    await act(async () => { await authChanged(viewer); });
    expect(screen.getByText(/Denied.*role is not valid/)).toBeInTheDocument();
});

it('rejects an unverified email before querying the allowlist', async () => {
    render(<AuthProvider><Status /></AuthProvider>);
    await act(async () => { await authChanged({ ...viewer, emailVerified: false }); });
    expect(screen.getByText(/Denied.*verified email/)).toBeInTheDocument();
    expect(mocks.getDoc).not.toHaveBeenCalled();
});
