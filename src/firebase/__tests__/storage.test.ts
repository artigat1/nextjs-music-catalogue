import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteObject } from 'firebase/storage';
import { deleteImage } from '@/firebase/storage';

vi.mock('@/firebase/config', () => ({
    storage: {},
}));

vi.mock('firebase/storage', () => ({
    ref: vi.fn((_storage, url) => ({ url })),
    uploadBytesResumable: vi.fn(),
    deleteObject: vi.fn(),
}));

const GS_URL = 'gs://bucket/recordings/abc/gallery/1-x.jpg';

describe('deleteImage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('deletes the object from storage', async () => {
        vi.mocked(deleteObject).mockResolvedValue(undefined);
        await expect(deleteImage(GS_URL)).resolves.toBeUndefined();
        expect(deleteObject).toHaveBeenCalledTimes(1);
    });

    it('does not touch storage for external URLs', async () => {
        await deleteImage('https://example.com/a.jpg');
        expect(deleteObject).not.toHaveBeenCalled();
    });

    it('resolves when the object no longer exists, so the dangling reference can be removed', async () => {
        vi.mocked(deleteObject).mockRejectedValue({ code: 'storage/object-not-found' });
        await expect(deleteImage(GS_URL)).resolves.toBeUndefined();
    });

    it('still throws for other storage errors', async () => {
        const error = { code: 'storage/unauthorized' };
        vi.mocked(deleteObject).mockRejectedValue(error);
        await expect(deleteImage(GS_URL)).rejects.toBe(error);
    });
});
