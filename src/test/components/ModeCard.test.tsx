import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeCard } from '../../components/shared/ModeCard';

describe('ModeCard', () => {
  it('should render with name and description', () => {
    render(
      <ModeCard
        id="solo"
        name="Solo"
        description="Play alone"
        icon={<span>🎮</span>}
        isSelected={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Solo')).toBeInTheDocument();
    expect(screen.getByText('Play alone')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    
    render(
      <ModeCard
        id="solo"
        name="Solo"
        description="Play alone"
        icon={<span>🎮</span>}
        isSelected={false}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have selected class when selected', () => {
    render(
      <ModeCard
        id="solo"
        name="Solo"
        description="Play alone"
        icon={<span>🎮</span>}
        isSelected={true}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('selected');
  });
});