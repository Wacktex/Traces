export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderTop: '1.5px solid #f0ece4',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}

export function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[0, 0.18, 0.36].map((delay, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#c8bfaa',
            animation: `pulse 1.4s ease ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

interface SongCardProps {
  title: string;
  artist: string;
  albumArt: string | null;
  spotifyUrl: string;
  note?: string | null;
}

export function SongCard({ title, artist, albumArt, spotifyUrl, note }: SongCardProps) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '16px 18px',
        display: 'flex',
        gap: 14,
        alignItems: 'center',
      }}
    >
      {albumArt ? (
        <img
          src={albumArt}
          alt={title}
          style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            background: 'rgba(44,74,62,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#4a8060',
          }}
        >
          ♫
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            color: '#f0ece4',
            fontWeight: 500,
            marginBottom: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 11.5,
            color: '#6b6866',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {artist}
        </p>
        {note && (
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: '#9a9490',
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            &quot;{note}&quot;
          </p>
        )}
      </div>
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          color: '#1DB954',
          fontSize: 11,
          letterSpacing: '0.1em',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        open ↗
      </a>
    </div>
  );
}
