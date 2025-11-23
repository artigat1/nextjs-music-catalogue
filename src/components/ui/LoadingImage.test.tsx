import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingImage from './LoadingImage';

describe('LoadingImage', () => {
    const defaultProps = {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image',
        width: 100,
        height: 100,
    };

    it('renders the image with correct attributes', () => {
        render(<LoadingImage {...defaultProps} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('alt', 'Test Image');
        // Next.js Image component modifies the src, so we check if it contains the encoded original src
        expect(img.getAttribute('src')).toContain(encodeURIComponent('https://example.com/image.jpg'));
    });

    it('shows loading state initially', () => {
        const { container } = render(<LoadingImage {...defaultProps} />);
        // The loading spinner/skeleton is present
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('removes loading state when image loads', async () => {
        const { container } = render(<LoadingImage {...defaultProps} />);
        const img = screen.getByRole('img');

        fireEvent.load(img);

        // Loading spinner should be gone
        await waitFor(() => {
            expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
        });
    });

    it('shows error state when image fails to load', () => {
        render(<LoadingImage {...defaultProps} />);
        const img = screen.getByRole('img');

        fireEvent.error(img);

        expect(screen.getByText('Image not available')).toBeInTheDocument();
    });
});
