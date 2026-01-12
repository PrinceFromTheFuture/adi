import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealForm from '@/components/meals/MealForm';

describe('MealForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render meal form fields', () => {
    render(<MealForm mealType="breakfast" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/food name/i) || screen.getByPlaceholderText(/food/i)).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup();

    render(<MealForm mealType="breakfast" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const foodNameInput = screen.getByLabelText(/food name/i) || screen.getByPlaceholderText(/food/i);
    await user.type(foodNameInput, 'Oatmeal');

    const caloriesInput = screen.getByLabelText(/calories/i) || screen.getByPlaceholderText(/calories/i);
    await user.type(caloriesInput, '350');

    const submitButton = screen.getByRole('button', { name: /save|submit|add/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<MealForm mealType="breakfast" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should populate form with existing meal data when editing', () => {
    const existingMeal = {
      id: 1,
      food_name: 'Pasta',
      calories: 500,
      protein: 15,
      carbs: 80,
      fat: 10,
      meal_type: 'lunch',
    };

    render(<MealForm meal={existingMeal} mealType="lunch" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const foodNameInput = screen.getByLabelText(/food name/i) || screen.getByDisplayValue('Pasta');
    expect(foodNameInput).toHaveValue('Pasta');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(<MealForm mealType="breakfast" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /save|submit|add/i });
    await user.click(submitButton);

    // Form should not submit if required fields are empty
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});

