import React from 'react';

interface SignatureButtonProps {
  onClick: () => void;
  className?: string;
}

const SignatureButton: React.FC<SignatureButtonProps> = ({ onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className ?? 'px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2'}
      aria-label="Signer électroniquement avec QR code et traçabilité"
      title="Signature électronique sécurisée avec QR code pour validation et traçabilité du document"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      Signature électronique
    </button>
  );
};

export default SignatureButton;
