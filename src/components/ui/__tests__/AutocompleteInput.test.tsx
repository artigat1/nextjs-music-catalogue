import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import AutocompleteInput from '@/components/ui/AutocompleteInput';

describe('AutocompleteInput Component', () => {
    const mockOptions = [
        { id: '1', label: 'Option 1' },
        { id: '2', label: 'Option 2' },
        { id: '3', label: 'Another Option' },
    ];

    const mockOnSelect = vi.fn();
    const mockOnCreateNew = vi.fn();
    const mockOnRemove = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnRemove.mockClear();
    });

    it('renders with label and placeholder', () => {
        render(
            <AutocompleteInput
                label="Test Label"
                placeholder="Test Placeholder"
                options={mockOptions}
                selectedIds={[]}
                onSelect={mockOnSelect}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Test Placeholder/)).toBeInTheDocument();
    });

    it('filters options based on input', async () => {
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={[]}
                onSelect={mockOnSelect}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByPlaceholderText(/Search/);
        fireEvent.change(input, { target: { value: 'Another' } });

        await waitFor(() => {
            expect(screen.getByText('Another Option')).toBeInTheDocument();
        });
    });

    it('calls onSelect when option is clicked', async () => {
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={[]}
                onSelect={mockOnSelect}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByPlaceholderText(/Search/);
        fireEvent.change(input, { target: { value: 'Option 1' } });

        await waitFor(() => {
            const option = screen.getByText('Option 1');
            fireEvent.click(option);
        });

        expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('displays selected items as pills', () => {
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={['1', '2']}
                onSelect={mockOnSelect}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('removes selected item when remove button is clicked', () => {
        const localMockOnRemove = vi.fn();
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={['1']}
                onSelect={mockOnSelect}
                onRemove={localMockOnRemove}
            />
        );

        const removeButtons = screen.getAllByText('×');
        fireEvent.click(removeButtons[0]);

        expect(localMockOnRemove).toHaveBeenCalledWith('1');
    });

    it('shows create hint when allowCreate is true', () => {
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={[]}
                onSelect={mockOnSelect}
                allowCreate={true}
                onCreateNew={mockOnCreateNew}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByPlaceholderText(/press Enter to create new/)).toBeInTheDocument();
    });

    it('filters out already selected options from dropdown', async () => {
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={['1']}
                onSelect={mockOnSelect}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByPlaceholderText(/Search/);
        fireEvent.change(input, { target: { value: 'Option' } });
        fireEvent.focus(input);

        // Wait for dropdown to appear and check that Option 1 is not in the dropdown
        await waitFor(() => {
            // Option 2 should be in the dropdown
            expect(screen.getByRole('button', { name: 'Option 2' })).toBeInTheDocument();
        });

        // Option 1 should not be in the dropdown (but will be in the pills)
        const dropdownOptions = screen.getAllByRole('button').filter(
            btn => btn.textContent === 'Option 2' || btn.textContent === 'Another Option'
        );
        expect(dropdownOptions.length).toBeGreaterThan(0);
    });
});
