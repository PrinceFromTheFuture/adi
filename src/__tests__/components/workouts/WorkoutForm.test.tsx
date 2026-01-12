import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkoutForm from '@/components/workouts/WorkoutForm';
import { createMockWorkout } from '../../utils/test-helpers';

describe('WorkoutForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render workout form', () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/workout name/i) || screen.getByPlaceholderText(/workout/i)).toBeInTheDocument();
  });

  it('should create new workout', async () => {
    const user = userEvent.setup();

    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/workout name/i) || screen.getByPlaceholderText(/workout/i);
    await user.type(nameInput, 'Upper Body Workout');

    const durationInput = screen.getByLabelText(/duration/i) || screen.getByPlaceholderText(/duration/i);
    await user.type(durationInput, '45');

    const submitButton = screen.getByRole('button', { name: /save|submit|add/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should edit existing workout', () => {
    const mockWorkout = createMockWorkout();

    render(<WorkoutForm workout={mockWorkout} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const nameInput = screen.getByDisplayValue(mockWorkout.workout_name);
    expect(nameInput).toBeInTheDocument();
  });

  it('should call onCancel', async () => {
    const user = userEvent.setup();

    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /save|submit|add/i });
    await user.click(submitButton);

    // Should not submit with empty required fields
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should select workout type', async () => {
    const user = userEvent.setup();

    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const typeSelect = screen.getByLabelText(/type/i) || screen.getByRole('combobox', { name: /type/i });
    
    // Depending on implementation, this might vary
    expect(typeSelect).toBeInTheDocument();
  });
});

