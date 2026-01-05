
import React, { useState } from 'react';

interface PixPaymentProps {
  pixData: {
    qrcode: string;
    imagem_base64: string;
  } | null;
  loading: boolean;
}

const PixPayment: React.FC<PixPaymentProps> = ({ pixData, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (pixData && pixData.qrcode) {
      navigator.clipboard.writeText(pixData.qrcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-[#009688] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Gerando cobrança PIX segura...</p>
      </div>
    );
  }

  if (!pixData || !pixData.qrcode) {
    return (
      <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <i className="fa-brands fa-pix text-4xl mb-3 opacity-20"></i>
        <p className="text-xs font-medium uppercase tracking-tight">O QR Code aparecerá aqui após clicar em finalizar.</p>
      </div>
    );
  }

  // Função para tratar a fonte da imagem
  const getImageSource = (src: string) => {
    if (!src) return '';
    if (src.startsWith('http')) return src; // Se for URL (ex: qrserver)
    if (src.startsWith('data:image')) return src; // Se já tiver o prefixo
    return `data:image/png;base64,${src}`; // Se for Base64 puro
  };

  const imageSrc = getImageSource(pixData.imagem_base64);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-teal-50 animate-fadeIn">
      <div className="bg-white p-3 rounded-2xl shadow-xl shadow-teal-100/50 mb-6 border border-teal-50">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Pix QR Code" 
            className="w-48 h-48 rounded-lg object-contain"
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <i className="fa-brands fa-pix text-4xl text-teal-200"></i>
          </div>
        )}
      </div>

      <div className="text-center space-y-4 w-full">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Código Copia e Cola:</p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[10px] break-all font-mono text-gray-500 leading-relaxed max-h-24 overflow-y-auto text-center">
            {pixData.qrcode}
          </div>
        </div>

        <button 
          onClick={handleCopy}
          className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${copied ? 'bg-[#00df5e] text-white' : 'bg-[#0b1320] text-white hover:bg-black'}`}
        >
          {copied ? (
            <><i className="fa-solid fa-check"></i> Código Copiado!</>
          ) : (
            <><i className="fa-regular fa-copy"></i> Copiar Código Pix</>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-2 text-[#009688]">
           <i className="fa-solid fa-clock-rotate-left text-[10px]"></i>
           <p className="text-[10px] font-bold uppercase tracking-wide">Aprovação imediata após o pagamento</p>
        </div>
      </div>
    </div>
  );
};

export default PixPayment;
