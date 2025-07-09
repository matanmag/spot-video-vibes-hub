import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import * as useAuthModule from '@/hooks/useAuth';

jest.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

jest.mock('@/hooks/useAuth');

const mockedUseAuth = useAuthModule as jest.Mocked<typeof useAuthModule>;

it('redirects to login when no user', () => {
  mockedUseAuth.useAuth.mockReturnValue({ user: null, loading: false } as any);
  const { container } = render(
    <MemoryRouter>
      <ProtectedRoute>
        <div>Private</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
  expect(container.innerHTML).toBe('');
});

it('renders children when authenticated', () => {
  mockedUseAuth.useAuth.mockReturnValue({ user: { id: '1' }, loading: false } as any);
  const { getByText } = render(
    <MemoryRouter>
      <ProtectedRoute>
        <div>Private</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
  expect(getByText('Private')).toBeInTheDocument();
});
