import { render, screen } from '@testing-library/react-native';
import EmptyState from '../components/EmptyState';

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

  it('matches the snapshot', async () => {
    await render(<EmptyState title="No expenses yet" message="Tap + to add one." />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
