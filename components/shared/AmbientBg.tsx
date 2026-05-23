export function AmbientBg() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(44,74,62,0.16) 0%, transparent 70%)',
          filter: 'blur(90px)',
          top: -200,
          left: -150,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientDrift1 18s ease-in-out infinite alternate',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,31,36,0.13) 0%, transparent 70%)',
          filter: 'blur(80px)',
          bottom: -100,
          right: -100,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientDrift2 22s ease-in-out infinite alternate',
        }}
      />
    </>
  );
}
