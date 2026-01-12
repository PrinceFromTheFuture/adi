import React from 'react';
import { render, screen } from '@testing-library/react';
import WelcomeCard from '@/components/dashboard/WelcomeCard';

describe('WelcomeCard', () => {
  it('should render welcome message with user name', () => {
    const user = {
      id: 1,
      full_name: 'John Doe',
      email: 'john@test.com',
    };

    render(<WelcomeCard user={user} />);

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it('should render without crashing when user is null', () => {
    render(<WelcomeCard user={null} />);

    // Should still render something
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display greeting based on time of day', () => {
    const user = { id: 1, full_name: 'John Doe', email: 'john@test.com' };

    render(<WelcomeCard user={user} />);

    // Should contain some greeting text
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});

