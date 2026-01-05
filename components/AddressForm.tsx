
import React, { useEffect, useState } from 'react';
import { Address } from '../types';
import { STANDARD_SHIPPING_PRICE } from '../constants';

interface AddressFormProps {
  address: Address;
  setAddress: React.Dispatch<React.SetStateAction<Address>>;
  onContinue: () => void;
  currentShipping: number;
  setShippingPrice: (price: number) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, setAddress, onContinue, currentShipping, setShippingPrice }) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [subStep, setSubStep] = useState<'address' | 'shipping'>('address');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const cep = address.zipCode.replace(/\D/g, '');
    if (cep.length === 8) {
      handleSearchCep(cep);
    }
  }, [address.zipCode]);

  const handleSearchCep = async (cep: string) => {
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        }));
        setShowFullForm(true);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!address.street) newErrors.street = "Endereço é obrigatório";
    if (!address.number) newErrors.number = "Número é obrigatório";
    if (!address.neighborhood) newErrors.neighborhood = "Bairro é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoToShipping = () => {
    if (validateAddress()) {
      setSubStep('shipping');
    }
  };

  const inputStyle = (fieldName: string) => `
    w-full px-4 py-3 border rounded-xl outline-none text-gray-700 sm:text-sm transition-all shadow-sm font-medium
    ${errors[fieldName] ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'}
  `;
  
  const labelStyle = "block text-[11px] font-bold text-[#0b1320] mb-2 uppercase tracking-tight ml-1 opacity-80";

  if (subStep === 'shipping') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="pt-2 pb-6 border-b border-gray-100 relative">
          <button 
            onClick={() => setSubStep('address')}
            className="absolute top-0 right-0 text-gray-400 hover:text-blue-600 p-2 transition-colors active:opacity-60"
          >
            <i className="fa-regular fa-pen-to-square text-lg"></i>
          </button>
          <div className="space-y-1 text-sm text-[#0b1320]">
            <p className="font-bold tracking-tight text-[15px]">{address.street}, {address.number}{address.complement ? `, ${address.complement}` : ''}</p>
            <p className="font-medium text-gray-500">{address.neighborhood}, {address.city}/{address.state}</p>
            <p className="font-medium text-gray-500">{address.zipCode}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[13px] font-bold text-[#0b1320] tracking-tight">Escolha uma forma de entrega:</h3>
          
          <div className="space-y-3">
            <div 
              className={`block p-5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${currentShipping === 0 ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              onClick={() => setShippingPrice(0)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${currentShipping === 0 ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                   {currentShipping === 0 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-[#0b1320] tracking-tight">Frete Grátis</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">Entrega em até 7 dias</p>
                </div>
                <span className="font-black text-xs text-green-600 tracking-tight">GRÁTIS</span>
              </div>
            </div>

            <div 
              className={`block p-5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${currentShipping === STANDARD_SHIPPING_PRICE ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              onClick={() => setShippingPrice(STANDARD_SHIPPING_PRICE)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${currentShipping === STANDARD_SHIPPING_PRICE ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                   {currentShipping === STANDARD_SHIPPING_PRICE && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-[#0b1320] tracking-tight">Frete Sedex Express</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">Entrega em até 2 dias</p>
                </div>
                <span className="font-black text-xs text-[#0b1320] tracking-tight">R$ {STANDARD_SHIPPING_PRICE.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onContinue}
          className="w-full py-4 bg-[#00df5e] hover:bg-[#00c853] text-white font-bold rounded-xl uppercase text-[13px] tracking-widest flex items-center justify-center gap-2 transition-all active:opacity-80 shadow-lg shadow-green-100/50 mt-2"
        >
          Ir para Pagamento <i className="fa-solid fa-arrow-right text-xs"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="max-w-[180px]">
        <label className={labelStyle}>CEP</label>
        <div className="relative">
          <input 
            type="text" name="zipCode" value={address.zipCode} onChange={handleChange}
            placeholder="00000-000"
            inputMode="numeric"
            maxLength={9}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-gray-700 sm:text-sm shadow-sm font-medium"
          />
          {address.city && !loadingCep && (
            <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-bold uppercase text-gray-400 tracking-tight">
              {address.state} / {address.city}
            </span>
          )}
          {loadingCep && (
             <div className="absolute right-3 top-3.5">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
        </div>
      </div>

      {(showFullForm || address.street) && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className={labelStyle}>Endereço/Rua</label>
            <input 
              type="text" name="street" value={address.street} onChange={handleChange}
              className={inputStyle('street')}
            />
            {errors.street && <p className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-wide ml-1">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Número</label>
              <input 
                type="text" name="number" value={address.number} onChange={handleChange}
                inputMode="numeric"
                className={inputStyle('number')}
              />
              {errors.number && <p className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-wide ml-1">{errors.number}</p>}
            </div>
            <div>
              <label className={labelStyle}>Bairro</label>
              <input 
                type="text" name="neighborhood" value={address.neighborhood} onChange={handleChange}
                className={inputStyle('neighborhood')}
              />
              {errors.neighborhood && <p className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-wide ml-1">{errors.neighborhood}</p>}
            </div>
          </div>

          <div>
            <label className={labelStyle}>Complemento (Opcional)</label>
            <input 
              type="text" name="complement" value={address.complement || ''} onChange={handleChange}
              placeholder="Apto, Bloco, etc."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none sm:text-sm shadow-sm font-medium"
            />
          </div>

          <button 
            onClick={handleGoToShipping}
            className="w-full py-4 bg-[#0b1320] hover:bg-black text-white font-bold rounded-xl uppercase text-[13px] tracking-widest flex items-center justify-center gap-2 transition-all active:opacity-80 mt-4 shadow-sm"
          >
            Escolher Frete <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressForm;
