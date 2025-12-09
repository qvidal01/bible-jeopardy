'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  roomCode: string;
  size?: number;
}

export default function QRCodeDisplay({ roomCode, size = 200 }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = typeof window !== 'undefined'
          ? `${window.location.origin}/join/${roomCode}`
          : `https://yourdomain.com/join/${roomCode}`;

        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#1e3a5f',
            light: '#ffffff',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR code generation failed:', err);
        setError('Failed to generate QR code');
      }
    };

    generateQR();
  }, [roomCode, size]);

  if (error) {
    return (
      <div className="text-red-400 text-sm text-center p-4">
        {error}
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center p-4" style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-2 rounded-lg shadow-lg">
        <img
          src={qrDataUrl}
          alt={`QR code to join room ${roomCode}`}
          width={size}
          height={size}
          className="block"
        />
      </div>
      <p className="text-blue-300 text-xs">Scan to join on mobile</p>
    </div>
  );
}
