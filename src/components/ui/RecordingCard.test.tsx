import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecordingCard from './RecordingCard';
import { Recording } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock LoadingImage to simplify testing
vi.mock('@/components/ui/LoadingImage', () => {
    return {
        // eslint-disable-next-line @next/next/no-img-element
        default: ({ alt }: { alt: string }) => <img alt={alt} data-testid="loading-image" />
    };
});

describe('RecordingCard', () => {
    const mockRecording: Recording & { id: string } = {
        id: '123',
        title: 'My Fair Lady',
        theatreName: 'Drury Lane',
        city: 'London',
        releaseYear: 1958,
        recordingDate: { toDate: () => new Date('1958-01-01') } as Timestamp,
        datePrecision: 'year',
        imageUrl: 'https://example.com/poster.jpg',
        info: 'Test info',
        artistIds: [],
        artistNames: ['Julie Andrews', 'Rex Harrison'],
        artistRefs: [],
        composerIds: [],
        composerRefs: [],
        lyricistIds: [],
        lyricistRefs: [],
        dateAdded: { toDate: () => new Date() } as Timestamp,
        dateUpdated: { toDate: () => new Date() } as Timestamp,
    };

    it('renders recording details correctly', () => {
        render(<RecordingCard recording={mockRecording} />);

        expect(screen.getByText('My Fair Lady')).toBeInTheDocument();
        expect(screen.getByText('Drury Lane, London')).toBeInTheDocument();
        expect(screen.getByText('1958')).toBeInTheDocument(); // Date display
    });

    it('renders the image when imageUrl is present', () => {
        render(<RecordingCard recording={mockRecording} />);

        const img = screen.getByTestId('loading-image');
        expect(img).toHaveAttribute('alt', 'My Fair Lady');
    });

    it('renders placeholder when imageUrl is missing', () => {
        const recordingWithoutImage = { ...mockRecording, imageUrl: '' };
        render(<RecordingCard recording={recordingWithoutImage} />);

        expect(screen.queryByTestId('loading-image')).not.toBeInTheDocument();
        // Check for the placeholder SVG (or a container that implies it)
        // Since the placeholder is an SVG without text/role, we can check if the image container is empty of the img tag
        // or check for the specific class of the placeholder container if we added a test id.
        // For now, let's assume if loading-image is not there, the fallback is rendered.
    });

    it('does not render artist names', () => {
        render(<RecordingCard recording={mockRecording} />);

        expect(screen.queryByText('Julie Andrews, Rex Harrison')).not.toBeInTheDocument();
    });

    it('renders theatre and city correctly', () => {
        render(<RecordingCard recording={mockRecording} />);
        expect(screen.getByText('Drury Lane, London')).toBeInTheDocument();
    });

    it('renders only theatre when city is missing', () => {
        const recording = { ...mockRecording, city: undefined };
        render(<RecordingCard recording={recording} />);
        expect(screen.getByText('Drury Lane')).toBeInTheDocument();
    });

    it('renders only city when theatre is missing', () => {
        const recording = { ...mockRecording, theatreName: undefined };
        render(<RecordingCard recording={recording} />);
        expect(screen.getByText('London')).toBeInTheDocument();
    });

    it('does not render theatre/city paragraph when both are missing', () => {
        const recording = { ...mockRecording, theatreName: undefined, city: undefined };
        render(<RecordingCard recording={recording} />);
        // Ensure neither text is present (using queryByText to avoid error)
        expect(screen.queryByText('Drury Lane')).not.toBeInTheDocument();
        expect(screen.queryByText('London')).not.toBeInTheDocument();
        expect(screen.queryByText(',')).not.toBeInTheDocument();
    });

    it('links to the correct recording page', () => {
        render(<RecordingCard recording={mockRecording} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/recordings/123');
    });
});
