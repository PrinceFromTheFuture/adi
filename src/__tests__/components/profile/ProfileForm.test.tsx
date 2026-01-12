import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from '@/components/profile/ProfileForm';
import { createMockUser } from '../../utils/test-helpers';

describe('ProfileForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile form with initial data', () => {
    const mockUser = createMockUser();

    render(
      <ProfileForm initialData={mockUser} onSave={mockOnSave} onCancel={mockOnCancel} isSaving={false} />
    );

    expect(screen.getByDisplayValue(mockUser.full_name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser();

    render(
      <ProfileForm initialData={mockUser} onSave={mockOnSave} onCancel={mockOnCancel} isSaving={false} />
    );

    const saveButton = screen.getByRole('button', { name: /save|submit/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should update form fields', async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser();

    render(
      <ProfileForm initialData={mockUser} onSave={mockOnSave} onCancel={mockOnCancel} isSaving={false} />
    );

    const ageInput = screen.getByLabelText(/age/i) || screen.getByDisplayValue(mockUser.age.toString());
    await user.clear(ageInput);
    await user.type(ageInput, '35');

    expect(ageInput).toHaveValue(35);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser();

    render(
      <ProfileForm initialData={mockUser} onSave={mockOnSave} onCancel={mockOnCancel} isSaving={false} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable form during save', () => {
    const mockUser = createMockUser();

    render(
      <ProfileForm initialData={mockUser} onSave={mockOnSave} onCancel={mockOnCancel} isSaving={true} />
    );

    const saveButton = screen.getByRole('button', { name: /save|submit|saving/i });
    expect(saveButton).toBeDisabled();
  });

  it('should validate numeric fields', async () => {
    const user = userEvent.setup();
    const mockUser = createMockUser();

    render(
      <ProfileForm initialData={mockUser} onSave={mockOnSave} onCancel={mockOnCancel} isSaving={false} />
    );

    const weightInput = screen.getByLabelText(/current weight/i) || screen.getByDisplayValue(mockUser.current_weight.toString());
    await user.clear(weightInput);
    await user.type(weightInput, 'invalid');

    // The form should prevent non-numeric input
    expect(weightInput).not.toHaveValue('invalid');
  });
});

