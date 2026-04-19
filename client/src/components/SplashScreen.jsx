import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="splash">
      <div className="splash-logo">✂️</div>
      <div className="splash-title">Stitchify</div>
      <div className="splash-sub">On-demand tailoring</div>
    </div>
  );
}
