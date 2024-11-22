import React from 'react';
// ... other imports remain the same ...

export default function CreatorActivityBoard({ creatorId }: CreatorActivityBoardProps) {
  // ... other code remains the same ...

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-surface-light/70 hover:bg-surface-light/80'; // Increased from 50/60 to 70/80
    if (count <= 3) return 'bg-primary/25 hover:bg-primary/35';
    if (count <= 6) return 'bg-primary/50 hover:bg-primary/60';
    if (count <= 9) return 'bg-primary/75 hover:bg-primary/85';
    return 'bg-primary hover:bg-primary/90';
  };

  // ... rest of the component remains the same ...
}