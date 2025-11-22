import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import TheatreCreateModal from '@/components/ui/TheatreCreateModal';

describe('TheatreCreateModal Component', () => {
    const mockOnCreate = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders when isOpen is true', () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                theatreName="Test Theatre"
            />
        );

        expect(screen.getByText('Create New Theatre')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Theatre')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(
            <TheatreCreateModal
                isOpen={false}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                theatreName=""
            />
        );

        expect(screen.queryByText('Create New Theatre')).not.toBeInTheDocument();
    });

    it('calls onCreate with form data on submit', async () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                theatreName="Royal Opera"
            />
        );

        // Use placeholder text to find inputs
        const cityInput = screen.getByPlaceholderText(/London/i);
        const countryInput = screen.getByPlaceholderText(/United Kingdom/i);
        const createButton = screen.getByText('Create Theatre');

        fireEvent.change(cityInput, { target: { value: 'London' } });
        fireEvent.change(countryInput, { target: { value: 'UK' } });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(mockOnCreate).toHaveBeenCalledWith('Royal Opera', 'London', 'UK');
        });
    });

    it('calls onClose when cancel button is clicked', () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                theatreName=""
            />
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('displays theatre name as disabled input', () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                theatreName="My Theatre"
            />
        );

        const theatreInput = screen.getByDisplayValue('My Theatre');
        expect(theatreInput).toBeDisabled();
    });

    it('has required fields for city and country', () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                theatreName="Test"
            />
        );

        const cityInput = screen.getByPlaceholderText(/London/i);
        const countryInput = screen.getByPlaceholderText(/United Kingdom/i);

        expect(cityInput).toBeRequired();
        expect(countryInput).toBeRequired();
    });

    it('shows correct button text', () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                theatreName="Test"
            />
        );

        expect(screen.getByText('Create Theatre')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
});
