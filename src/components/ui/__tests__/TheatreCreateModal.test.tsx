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
                initialName="Test Theatre"
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
                initialName=""
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
                initialName="Royal Opera"
            />
        );

        const cityInput = screen.getByLabelText(/City/i);
        const countryInput = screen.getByLabelText(/Country/i);
        const createButton = screen.getByText('Create');

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
                initialName=""
            />
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('validates required fields', async () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                initialName=""
            />
        );

        const createButton = screen.getByText('Create');
        fireEvent.click(createButton);

        // Should not call onCreate if fields are empty
        await waitFor(() => {
            expect(mockOnCreate).not.toHaveBeenCalled();
        });
    });

    it('trims whitespace from inputs', async () => {
        render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                initialName="  Test Theatre  "
            />
        );

        const cityInput = screen.getByLabelText(/City/i);
        const countryInput = screen.getByLabelText(/Country/i);
        const createButton = screen.getByText('Create');

        fireEvent.change(cityInput, { target: { value: '  London  ' } });
        fireEvent.change(countryInput, { target: { value: '  UK  ' } });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(mockOnCreate).toHaveBeenCalledWith('Test Theatre', 'London', 'UK');
        });
    });

    it('closes modal on backdrop click', () => {
        const { container } = render(
            <TheatreCreateModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                initialName=""
            />
        );

        const backdrop = container.querySelector('.fixed.inset-0');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(mockOnClose).toHaveBeenCalled();
        }
    });
});
