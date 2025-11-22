import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import SearchPill from '@/components/ui/SearchPill';

describe('SearchPill Component', () => {
    it('renders with label', () => {
        render(<SearchPill label="Test Label" searchQuery="test" />);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('navigates to search page on click', () => {
        const { container } = render(<SearchPill label="Test Label" searchQuery="test query" />);
        const link = container.querySelector('a');

        expect(link).toHaveAttribute('href', '/search?q=test%20query');
    });

    it('applies correct styling classes', () => {
        const { container } = render(<SearchPill label="Test" searchQuery="test" />);
        const pill = container.querySelector('a');

        expect(pill).toHaveClass('inline-flex');
        expect(pill).toHaveClass('items-center');
        expect(pill).toHaveClass('px-3');
        expect(pill).toHaveClass('py-1');
    });

    it('encodes special characters in search query', () => {
        const { container } = render(<SearchPill label="Test" searchQuery="test & special" />);
        const link = container.querySelector('a');

        expect(link).toHaveAttribute('href', '/search?q=test%20%26%20special');
    });
});
