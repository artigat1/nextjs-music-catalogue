import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import LoginPage from '../page';

const mocks = vi.hoisted(() => ({ login: vi.fn(), verify: vi.fn(), signOut: vi.fn() }));
vi.mock('@/firebase/auth', () => ({ signInWithGoogle: mocks.login, signInWithMicrosoft: mocks.login, signOut: mocks.signOut }));
vi.mock('firebase/auth', () => ({ sendEmailVerification: mocks.verify }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, authError: null }) }));

beforeEach(() => { vi.clearAllMocks(); });

it.each(['Google', 'Microsoft'])('offers email verification for an unverified %s account', async (provider) => {
    const user = { emailVerified: false };
    mocks.login.mockResolvedValue(user);
    mocks.verify.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Sign in with ${provider}`) }));
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalled());
    expect(mocks.verify).toHaveBeenCalledWith(user);
    expect(screen.getByRole('status')).toHaveTextContent('Verification email sent');
});

it('does not send verification email for a verified account', async () => {
    mocks.login.mockResolvedValue({ emailVerified: true });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/ }));
    await waitFor(() => expect(mocks.login).toHaveBeenCalled());
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
});
