import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { mockRecording } from '@/test/mockData';
import RecordingEditorPage from '../page';

const state = vi.hoisted(() => ({ recording: undefined as unknown }));
const mutation = { mutateAsync: vi.fn(), isPending: false };

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    useParams: () => ({ id: 'recording-1' }),
}));
vi.mock('@/hooks/useQueries', () => ({
    useRecording: () => ({ data: state.recording, isLoading: false }),
    useTheatres: () => ({ data: [], isLoading: false }),
    usePeople: () => ({ data: [], isLoading: false }),
    useAddRecording: () => mutation,
    useUpdateRecording: () => mutation,
    useAddPerson: () => mutation,
    useAddTheatre: () => mutation,
}));
vi.mock('@/components/admin/ImageUpload', () => ({ ImageUpload: () => null }));

it('populates the form from a recording already cached on first render', () => {
    state.recording = mockRecording;
    render(<RecordingEditorPage />);
    expect(screen.getByDisplayValue('La Bohème')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-05-15')).toBeInTheDocument();
});

it('populates the form once the recording arrives, and again when it changes', () => {
    state.recording = undefined;
    const { rerender } = render(<RecordingEditorPage />);
    expect(screen.queryByDisplayValue('La Bohème')).not.toBeInTheDocument();

    state.recording = mockRecording;
    rerender(<RecordingEditorPage />);
    expect(screen.getByDisplayValue('La Bohème')).toBeInTheDocument();

    state.recording = { ...mockRecording, title: 'Carmen' };
    rerender(<RecordingEditorPage />);
    expect(screen.getByDisplayValue('Carmen')).toBeInTheDocument();
});
