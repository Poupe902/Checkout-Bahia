
import React from 'react';
import { CreditCard } from '../types';

interface CreditCardFormProps {
  card: CreditCard;
  setCard: React.Dispatch<React.SetStateAction<CreditCard>>;
  total: number;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ card, setCard, total }) => {
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 16);
    const parts = v.match(/.{1,4}/g);
    return parts ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2)}`;
    }
    return v;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setCard(prev => ({ ...prev, [name]: formattedValue }));
  };

  const inputStyle = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00df5e]/20 focus:border-[#00df5e] outline-none text-gray-700 text-sm transition-all placeholder:text-gray-300 shadow-sm font-medium";
  const labelStyle = "block text-[11px] font-bold text-[#0b1320] mb-1.5 uppercase tracking-tight ml-1 opacity-70";

  // Gera opções de parcelas de 1x a 12x
  const installmentOptions = Array.from({ length: 12 }, (_, i) => {
    const count = i + 1;
    const valuePerInstallment = total / count;
    return {
      value: count.toString(),
      label: `${count}x de R$ ${valuePerInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${count === 1 ? 'à vista' : 'sem juros'}`
    };
  });

  return (
    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-fadeIn">
      <div>
        <label className={labelStyle}>Número do Cartão</label>
        <div className="relative">
          <input 
            type="text" 
            name="number" 
            value={card.number} 
            onChange={handleChange}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className={`${inputStyle} pl-12`}
          />
          <i className="fa-solid fa-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg"></i>
        </div>
      </div>
      
      <div>
        <label className={labelStyle}>Nome no Cartão</label>
        <input 
          type="text" 
          name="name" 
          value={card.name} 
          onChange={handleChange}
          placeholder="COMO IMPRESSO NO CARTÃO"
          className={`${inputStyle} uppercase`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Validade</label>
          <input 
            type="text" 
            name="expiry" 
            value={card.expiry} 
            onChange={handleChange}
            placeholder="MM/AA"
            maxLength={5}
            className={inputStyle}
          />
        </div>
        <div>
          <label className={labelStyle}>CVV</label>
          <input 
            type="text" 
            name="cvv" 
            value={card.cvv} 
            onChange={handleChange}
            placeholder="123"
            maxLength={4}
            className={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className={labelStyle}>Escolha as parcelas</label>
        <div className="relative">
          <select
            name="installments"
            value={card.installments || '1'}
            onChange={handleChange}
            className={`${inputStyle} appearance-none cursor-pointer pr-10 bg-white font-bold text-[#0b1320]`}
          >
            {installmentOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
        </div>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-xl flex gap-3 items-center border border-blue-100/50">
        <i className="fa-solid fa-shield-halved text-blue-500 text-lg opacity-60"></i>
        <p className="text-[10px] text-blue-700 leading-tight font-bold uppercase tracking-tight">
          Sua transação é protegida por SSL de 256 bits. Seus dados financeiros não são armazenados em nossos servidores.
        </p>
      </div>
    </div>
  );
};

export default CreditCardForm;
