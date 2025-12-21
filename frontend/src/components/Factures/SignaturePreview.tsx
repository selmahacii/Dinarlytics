import React from 'react';

interface SignaturePreviewProps {
  dataUrl?: string;
}

const SignaturePreview: React.FC<SignaturePreviewProps> = ({ dataUrl }) => {
  if (!dataUrl) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
      <span className="text-xs text-slate-500">Signature:</span>
      <img src={dataUrl} alt="Signature du client" className="h-8 object-contain" />
    </div>
  );
};

export default SignaturePreview;
