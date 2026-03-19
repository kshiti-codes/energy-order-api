import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockOrders = [
  {
    id: 'abc-123',
    customerName: 'Anna Müller',
    product: 'SOLAR_PANEL',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'def-456',
    customerName: 'Max Bauer',
    product: 'EV_CHARGER',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  },
];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options?: RequestInit) => {
      if (!options || options.method === 'GET' || options.method === undefined) {
        return Promise.resolve({
          json: () => Promise.resolve(mockOrders),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({}),
      });
    }),
  );
});

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('App rendering', () => {
  it('renders the EnergyOrder header', async () => {
    render(<App />);
    expect(screen.getByText(/EnergyOrder/i)).toBeInTheDocument();
  });

  it('renders the New Order form', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Anna Müller/i)).toBeInTheDocument();
    expect(screen.getByText(/Place Order/i)).toBeInTheDocument();
  });

  it('renders the product dropdown with all three options', () => {
    render(<App />);
    expect(screen.getByText(/Solar Panel/i)).toBeInTheDocument();
    expect(screen.getByText(/Heat Pump/i)).toBeInTheDocument();
    expect(screen.getByText(/EV Charger/i)).toBeInTheDocument();
  });
});

// ─── Order list ──────────────────────────────────────────────────────────────

describe('Order list', () => {
  it('loads and displays orders from API', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Anna Müller')).toBeInTheDocument();
      expect(screen.getByText('Max Bauer')).toBeInTheDocument();
    });
  });

  it('displays order status badge', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    });
  });

  it('shows Advance button for non-COMPLETED orders', async () => {
    render(<App />);
    await waitFor(() => {
      const advanceBtns = screen.getAllByText(/Advance/i);
      expect(advanceBtns.length).toBeGreaterThan(0);
    });
  });
});

// ─── Form validation ─────────────────────────────────────────────────────────

describe('Form validation', () => {
  it('shows error when submitting without a customer name', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Place Order/i));
    await waitFor(() => {
      expect(screen.getByText(/Customer name is required/i)).toBeInTheDocument();
    });
  });

  it('clears the error after typing a name', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Place Order/i));
    await waitFor(() => screen.getByText(/Customer name is required/i));

    fireEvent.change(screen.getByPlaceholderText(/Anna Müller/i), {
      target: { value: 'Test User' },
    });
    fireEvent.click(screen.getByText(/Place Order/i));

    await waitFor(() => {
      expect(screen.queryByText(/Customer name is required/i)).not.toBeInTheDocument();
    });
  });
});

// ─── Order submission ────────────────────────────────────────────────────────

describe('Placing an order', () => {
  it('calls POST /orders with correct payload', async () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/Anna Müller/i), {
      target: { value: 'Klara Schmidt' },
    });
    fireEvent.click(screen.getByText(/Place Order/i));

    await waitFor(() => {
      const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
      const postCall = calls.find(
        (call) => (call[1] as RequestInit)?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse(postCall![1].body as string);
      expect(body.customerName).toBe('Klara Schmidt');
    });
  });

  it('clears the customer name input after successful submit', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Anna Müller/i);

    fireEvent.change(input, { target: { value: 'Klara Schmidt' } });
    fireEvent.click(screen.getByText(/Place Order/i));

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });
});