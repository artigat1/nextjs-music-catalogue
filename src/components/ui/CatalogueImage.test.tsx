import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getBlob, ref } from 'firebase/storage';
import CatalogueImage from './CatalogueImage';

vi.mock('firebase/storage', () => ({ getBlob: vi.fn(), ref: vi.fn(() => 'storage-reference') }));
const createObjectURL = vi.fn(() => 'blob:private-image');
const revokeObjectURL = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
});

it.each([
    'gs://music-catalogue.firebasestorage.app/recordings/example/image.png',
    'https://storage.googleapis.com/music-catalogue.firebasestorage.app/recordings/example/image.png',
    'https://firebasestorage.googleapis.com/v0/b/music-catalogue.firebasestorage.app/o/recordings%2Fexample%2Fimage.png?alt=media&token=old-token',
])('uses authenticated blob downloads for %s', async (src) => {
    vi.mocked(getBlob).mockResolvedValue(new Blob(['private']));
    const { unmount } = render(<CatalogueImage src={src} alt="Private image" width={100} height={100} />);
    await waitFor(() => expect(screen.getByAltText('Private image')).toHaveAttribute('src', 'blob:private-image'));
    expect(ref).toHaveBeenCalledWith({}, src);
    expect(getBlob).toHaveBeenCalledWith('storage-reference');
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:private-image');
});

it('does not fall back to a public token URL on access denied', async () => {
    vi.mocked(getBlob).mockRejectedValue(new Error('Access denied'));
    render(<CatalogueImage src="gs://bucket/recordings/image.png" alt="Denied image" width={100} height={100} />);
    await waitFor(() => expect(screen.getByAltText('Denied image')).toHaveAttribute('src', 'data:,'));
});

it('never sends external catalogue images to the public image optimizer', () => {
    render(<CatalogueImage src="https://example.com/image.png" alt="External image" width={100} height={100} />);
    expect(screen.getByAltText('External image')).toHaveAttribute('src', 'https://example.com/image.png');
    expect(getBlob).not.toHaveBeenCalled();
});


afterEach(() => vi.unstubAllGlobals());

it('defers private downloads until the image approaches the viewport', async () => {
    let enterViewport: (entries: { isIntersecting: boolean }[]) => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', vi.fn(function(callback) {
        enterViewport = callback;
        return { observe: vi.fn(), disconnect };
    }));
    vi.mocked(getBlob).mockResolvedValue(new Blob(['private']));
    render(<CatalogueImage src="gs://bucket/recordings/image.png" alt="Lazy image" width={100} height={100} />);
    expect(getBlob).not.toHaveBeenCalled();
    enterViewport([{ isIntersecting: true }]);
    await waitFor(() => expect(screen.getByAltText('Lazy image')).toHaveAttribute('src', 'blob:private-image'));
    expect(disconnect).toHaveBeenCalled();
});
