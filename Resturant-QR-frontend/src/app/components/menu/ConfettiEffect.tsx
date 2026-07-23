import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

const colors = [
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
];

export function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
      }));
      setConfetti(pieces);
      setShow(true);

      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className={`absolute w-3 h-3 ${piece.color}`}
          style={{
            left: piece.x,
            top: piece.y,
            scale: piece.scale,
          }}
          animate={{
            y: [piece.y, window.innerHeight + 50],
            x: [piece.x, piece.x + (Math.random() * 200 - 100)],
            rotate: [piece.rotation, piece.rotation + 360 * 3],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
