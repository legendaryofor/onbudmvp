import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    
    // Extract params
    const type = searchParams.get('type') || 'Backed'; // 'Backed' or 'Exited'
    const creatorName = searchParams.get('creatorName') || 'Creator';
    const creatorAvatar = searchParams.get('avatar') || 'https://ui-avatars.com/api/?name=Creator';
    const amount = searchParams.get('amount') || '0.00';
    const pnl = searchParams.get('pnl'); // Only for exit

    // Determine colors
    const isExit = type.toLowerCase() === 'exited';
    const isUp = pnl ? parseFloat(pnl) >= 0 : true;
    const accentColor = isExit ? (isUp ? '#00FF66' : '#e11d48') : '#00FF66';
    const actionText = isExit ? 'Exited Position' : 'Backed Creator';
    
    // Load local Onbud logo
    const logoUrl = `${origin}/onbud-logo.svg`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'radial-gradient(circle at 50% -20%, #1a2e23 0%, #000000 60%)',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Glassmorphic Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '800px',
              height: '450px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '32px',
              padding: '40px',
              boxShadow: '0 0 80px rgba(0, 255, 102, 0.1)',
            }}
          >
            {/* Header: Logo and Action */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                 <img src={logoUrl} width="160" height="auto" />
              </div>
              <div
                style={{
                  color: accentColor,
                  fontSize: 24,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: `${accentColor}20`, // 20% opacity
                  padding: '8px 24px',
                  borderRadius: '100px',
                  border: `1px solid ${accentColor}50`,
                }}
              >
                {actionText}
              </div>
            </div>

            {/* Center Content: Creator Info */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px', marginTop: '20px' }}>
              <img
                src={creatorAvatar}
                width="160"
                height="160"
                style={{
                  borderRadius: '80px',
                  border: '4px solid rgba(255, 255, 255, 0.2)',
                  objectFit: 'cover',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1
                  style={{
                    fontSize: 64,
                    fontWeight: 900,
                    color: 'white',
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {creatorName}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '10px' }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: 'white' }}>
                    B {amount}
                  </span>
                  <span style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.6)' }}>Total Value</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer: PnL (if exited) or Stamp */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: '20px' }}>
              {isExit && pnl ? (
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: accentColor,
                    textShadow: `0 0 20px ${accentColor}40`,
                  }}
                >
                  {isUp ? '+' : ''}B {pnl} P&L
                </div>
              ) : (
                <div style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)', display: 'flex', gap: '8px' }}>
                  <span>Back creators you love at</span>
                  <span style={{ color: 'white' }}>onbud.xyz</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
