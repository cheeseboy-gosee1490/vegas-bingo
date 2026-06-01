import React, { useState, useEffect } from 'react';

const items = [
  'Elvis impersonator',
  'Bride in a wedding dress',
  'Bachelor party',
  'Bachelorette party',
  'Someone drinking before 9am',
  'Hear Mr Brightside',
  'Limousine',
  'Influencer filming',
  'Someone crying',
  'Celebrity sighting',
  'Lost tourist',
  'Proposal',
  'Uber queue chaos',
  'Lamborghini',
  'Casino carpet photo',
  'Dog wearing clothes',
  'Mobility scooter',
  'Rolls-Royce',
  'Carrying shoes',
  'What happens in Vegas'
];

export default function App() {
  const [checked, setChecked] = useState(
    () => JSON.parse(localStorage.getItem('vb') || '{}')
  );

  useEffect(() => {
    localStorage.setItem('vb', JSON.stringify(checked));
  }, [checked]);

  const count = Object.values(checked).filter(Boolean).length;

  return (
    <div className="wrap">
      <h1>🎰 Vegas Bingo</h1>
      <p>{count}/{items.length} found</p>

      <div className="grid">
        {items.map(item => (
          <button
            key={item}
            className={checked[item] ? 'on' : ''}
            onClick={() =>
              setChecked({
                ...checked,
                [item]: !checked[item]
              })
            }
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
