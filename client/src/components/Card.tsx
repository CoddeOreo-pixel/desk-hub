import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  interactive?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, onClick, onContextMenu, className = '', interactive = false, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`${interactive ? 'card-interactive' : 'card'} grid-bg-dense ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
