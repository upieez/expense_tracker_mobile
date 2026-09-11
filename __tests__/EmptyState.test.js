import { render, screen } from '@testing-library/react-native';
import EmptyState from '../components/EmptyState';

// Note: @testing-library/react-native v14 renders asynchronously — render()
// must be awaited (v13 examples in the course materials call it synchronously).

describe('EmptyState', () => {
  it('renders title and message', async () => {
    await render(<EmptyState title="No expenses yet" message="Tap + to add one." />);
    expect(screen.getByText('No expenses yet')).toBeOnTheScreen();
    expect(screen.getByText('Tap + to add one.')).toBeOnTheScreen();
  });

  it('omits the message when not provided', async () => {
    await render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeOnTheScreen();
    expect(screen.queryByText('Tap + to add one.')).toBeNull();
  });

  // Snapshot testing as practised in Topic 5.1 ("Hack it: Snapshot testing").
  it('matches the snapshot', async () => {
    await render(<EmptyState title="No expenses yet" message="Tap + to add one." />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
