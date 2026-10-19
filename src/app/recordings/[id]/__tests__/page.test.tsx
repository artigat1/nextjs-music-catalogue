import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { mockRecording } from '@/test/mockData';
import RecordingDetailsPage from '../page';

const state = vi.hoisted(() => ({ recording: undefined as unknown }));
const firestore = vi.hoisted(() => ({ getDoc: vi.fn() }));

vi.mock('next/navigation', () => ({
    useParams: () => ({ id: 'recording-1' }),
}));
vi.mock('firebase/firestore', async () => ({
    ...(await vi.importActual('firebase/firestore')),
    getDoc: firestore.getDoc,
}));
vi.mock('@/hooks/useQueries', () => ({
    useRecording: () => ({ data: state.recording, isLoading: false }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/components/ui/LoadingImage', () => ({ default: () => null }));
vi.mock('@/components/ui/ImageCarousel', () => ({ default: () => null }));

beforeEach(() => {
    firestore.getDoc.mockReset();
    firestore.getDoc.mockResolvedValue({
        id: 'ref-1',
        exists: () => true,
        data: () => ({ name: 'Royal Opera House', city: 'London' }),
    });
});

it('shows the Theatre card when the recording has a theatre', async () => {
    state.recording = mockRecording;
    render(<RecordingDetailsPage />);

    expect(await screen.findByRole('heading', { name: 'Theatre' })).toBeInTheDocument();
    expect(screen.getByText('Royal Opera House')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
});

it('renders no Theatre card, or placeholder text, when the recording has no theatre', async () => {
    state.recording = { ...mockRecording, theatreRef: undefined, theatreName: undefined, city: undefined };
    render(<RecordingDetailsPage />);

    expect(await screen.findByRole('heading', { name: 'Artists' })).toBeInTheDocument();
    await waitFor(() => expect(firestore.getDoc).not.toHaveBeenCalled());
    expect(screen.queryByRole('heading', { name: 'Theatre' })).not.toBeInTheDocument();
    expect(screen.queryByText('Theatre information not available.')).not.toBeInTheDocument();
});

it('keeps the Theatre card with a fallback when the theatre document cannot be loaded', async () => {
    firestore.getDoc.mockResolvedValue({ id: 'ref-1', exists: () => false, data: () => undefined });
    state.recording = mockRecording;
    render(<RecordingDetailsPage />);

    expect(await screen.findByRole('heading', { name: 'Artists' })).toBeInTheDocument();
    await waitFor(() => expect(firestore.getDoc).toHaveBeenCalled());
    expect(screen.getByRole('heading', { name: 'Theatre' })).toBeInTheDocument();
    expect(screen.getByText('Theatre information not available.')).toBeInTheDocument();
});
