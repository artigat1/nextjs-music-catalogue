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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with label and placeholder', () => {
        render(
            <AutocompleteInput
                label="Test Label"
                placeholder="Test Placeholder"
                options={mockOptions}
                selectedIds={[]}
                onSelect={mockOnSelect}
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
            />
        );

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('removes selected item when remove button is clicked', () => {
        const mockOnRemove = vi.fn();
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

        const removeButtons = screen.getAllByText('×');
        fireEvent.click(removeButtons[0]);

        expect(mockOnRemove).toHaveBeenCalledWith('1');
    });

    it('handles paste of comma-separated values', async () => {
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={[]}
                onSelect={mockOnSelect}
                allowCreate={true}
                onCreateNew={mockOnCreateNew}
            />
        );

        const input = screen.getByPlaceholderText(/Search/);

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
        });

        Object.defineProperty(pasteEvent.clipboardData, 'getData', {
            value: () => 'New Item 1, New Item 2',
        });

        fireEvent(input, pasteEvent);

        await waitFor(() => {
            expect(mockOnCreateNew).toHaveBeenCalled();
        });
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
            />
        );

        expect(screen.getByPlaceholderText(/press Enter to create new/)).toBeInTheDocument();
    });

    it('filters out already selected options', async () => {
        render(
            <AutocompleteInput
                label="Test"
                placeholder="Search"
                options={mockOptions}
                selectedIds={['1']}
                onSelect={mockOnSelect}
            />
        );

        const input = screen.getByPlaceholderText(/Search/);
        fireEvent.change(input, { target: { value: 'Option' } });

        await waitFor(() => {
            expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
        });
    });
});
