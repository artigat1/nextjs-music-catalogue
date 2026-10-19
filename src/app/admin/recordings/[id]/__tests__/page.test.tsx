import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { mockRecording } from '@/test/mockData';
import RecordingEditorPage from '../page';

const state = vi.hoisted(() => ({ recording: undefined as unknown, id: 'recording-1' }));
const mutation = { mutateAsync: vi.fn(), isPending: false };
const addMutation = { mutateAsync: vi.fn(), isPending: false };
const updateMutation = { mutateAsync: vi.fn(), isPending: false };

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    useParams: () => ({ id: state.id }),
}));
vi.mock('@/hooks/useQueries', () => ({
    useRecording: () => ({ data: state.recording, isLoading: false }),
    useTheatres: () => ({ data: [], isLoading: false }),
    usePeople: () => ({ data: [], isLoading: false }),
    useAddRecording: () => addMutation,
    useUpdateRecording: () => updateMutation,
    useAddPerson: () => mutation,
    useAddTheatre: () => mutation,
}));
vi.mock('@/components/admin/ImageUpload', () => ({ ImageUpload: () => null }));

beforeEach(() => {
    state.id = 'recording-1';
    addMutation.mutateAsync.mockReset();
    updateMutation.mutateAsync.mockReset();
});

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

const fillNewRecording = async () => {
    state.id = 'new';
    state.recording = undefined;
    render(<RecordingEditorPage />);
    await userEvent.type(screen.getAllByRole('textbox')[0], 'Hamilton');
    await userEvent.type(screen.getByPlaceholderText('YYYY-MM-DD'), '2016-01-01');
};

it('defaults a new recording to live', async () => {
    await fillNewRecording();
    expect(screen.getByLabelText('Type')).toHaveValue('live');

    await userEvent.click(screen.getByRole('button', { name: 'Add Recording' }));

    expect(addMutation.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ recordingType: 'live' }));
});

it('saves a new cast or studio album', async () => {
    await fillNewRecording();

    await userEvent.selectOptions(screen.getByLabelText('Type'), 'album');
    await userEvent.click(screen.getByRole('button', { name: 'Add Recording' }));

    expect(addMutation.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ recordingType: 'album' }));
});

it('loads the stored type, treating a missing one as live', () => {
    state.recording = { ...mockRecording, recordingType: 'album' };
    const { rerender } = render(<RecordingEditorPage />);
    expect(screen.getByLabelText('Type')).toHaveValue('album');

    state.recording = { ...mockRecording, id: 'recording-2', recordingType: undefined };
    rerender(<RecordingEditorPage />);
    expect(screen.getByLabelText('Type')).toHaveValue('live');
});

it('writes the changed type when an existing recording is saved', async () => {
    state.recording = { ...mockRecording, recordingType: 'live' };
    render(<RecordingEditorPage />);

    await userEvent.selectOptions(screen.getByLabelText('Type'), 'album');
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'recording-1',
        data: expect.objectContaining({ recordingType: 'album' }),
    });
});
