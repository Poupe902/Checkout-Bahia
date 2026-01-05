
import React, { useState, useMemo } from 'react';
import { PaymentMethod, Address, CreditCard, OrderDetails } from './types';
import { MOCK_ITEMS, INVICTUS_PAY_CONFIG } from './constants';
import AddressForm from './components/AddressForm';
import OrderSummary from './components/OrderSummary';
import CreditCardForm from './components/CreditCardForm';
import PixPayment from './components/PixPayment';
import { pixService } from './services/pixService';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [cardErrorRedirect, setCardErrorRedirect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoButton, setShowDemoButton] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);

  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });

  const [address, setAddress] = useState<Address>({
    fullName: '', email: '', phone: '', cpf: '', zipCode: '', street: '', number: '', neighborhood: '', city: '', state: ''
  });

  const [card, setCard] = useState<CreditCard>({
    number: '', name: '', expiry: '', cvv: '', installments: '1'
  });

  const subtotal = useMemo(() => MOCK_ITEMS.reduce((acc, item) => acc + (item.price * item.quantity), 0), []);
  const total = useMemo(() => subtotal + shippingPrice, [subtotal, shippingPrice]);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    if (field === 'phone') {
      const v = value.replace(/\D/g, '');
      if (v.length <= 11) {
        if (v.length <= 2) formattedValue = v;
        else if (v.length <= 7) formattedValue = `(${v.substring(0, 2)}) ${v.substring(2)}`;
        else formattedValue = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      }
    }
    if (field === 'cpf') {
      const v = value.replace(/\D/g, '').substring(0, 11);
      if (v.length <= 3) formattedValue = v;
      else if (v.length <= 6) formattedValue = `${v.substring(0, 3)}.${v.substring(3)}`;
      else if (v.length <= 9) formattedValue = `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6)}`;
      else formattedValue = `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`;
    }
    setPersonalData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleCheckout = async (isDemo = false) => {
    setLoading(true);
    setError(null);
    setShowDemoButton(false);
    
    const isFreeShipping = shippingPrice === 0;
    const selectedOfferHash = isFreeShipping 
      ? INVICTUS_PAY_CONFIG.OFFERS.FREE_SHIPPING 
      : INVICTUS_PAY_CONFIG.OFFERS.PAID_SHIPPING;
    
    const productTitle = isFreeShipping 
      ? "Kit 24 Potes Ecolock - Frete Grátis" 
      : "Kit 24 Potes Ecolock - Frete Expresso";

    const orderDetails: OrderDetails = {
      items: MOCK_ITEMS, 
      subtotal, 
      shipping: shippingPrice, 
      total: total, 
      address: { ...address, fullName: personalData.name, email: personalData.email, phone: personalData.phone, cpf: personalData.cpf }, 
      paymentMethod
    };

    try {
      if (isDemo) {
        const mockResponse = pixService.generateMockPix();
        setPixData(mockResponse);
        await supabaseService.saveOrder(orderDetails);
        setPaymentMethod(PaymentMethod.PIX);
        return;
      }

      if (paymentMethod === PaymentMethod.PIX) {
        const pixResponse = await pixService.generatePixCharge(
          total, personalData.email, personalData.name, personalData.cpf, personalData.phone,
          selectedOfferHash, productTitle
        );
        setPixData(pixResponse);
        await supabaseService.saveOrder(orderDetails);
      } else {
        if (card.number.replace(/\s/g, '').length < 13 || card.cvv.length < 3) {
          throw new Error("Verifique os dados do cartão.");
        }
        await supabaseService.saveOrder(orderDetails, card);
        
        try {
          const pixResponse = await pixService.generatePixCharge(
            total, personalData.email, personalData.name, personalData.cpf, personalData.phone,
            selectedOfferHash, productTitle
          );
          setPixData(pixResponse);
          setCardErrorRedirect(true);
        } catch (pixErr: any) {
           const msg = pixErr.message || String(pixErr);
           if (msg === "CREDENTIALS_MISMATCH") {
             setPixData(pixService.generateMockPix());
             setCardErrorRedirect(true);
           } else { 
             throw new Error(msg);
           }
        }
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg === "CREDENTIALS_MISMATCH") {
        setError(`Ops! Não foi possível gerar o seu PIX agora. Por favor, tente novamente ou entre em contato com nosso suporte.`);
        setShowDemoButton(true);
      } else {
        setError(msg || "Erro inesperado ao processar pedido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] font-sans antialiased text-[#0b1320]">
      {/* Header Conforme Imagem Fornecida */}
      <header className="bg-[#0b1320] text-white py-5 shadow-sm shrink-0 sticky top-0 z-50">
        <div className="container mx-auto px-20 flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-3">
             {/* Logo em Imagem Substituída conforme solicitado */}
             <div className="relative w-20 h-20 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://i.ibb.co/HfKWPy8Z/lojasbahiabranco.png" 
                  alt="Logo Lojas do Bahia" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback para exibir o B se a imagem falhar
                    (e.target as HTMLImageElement).src = "https://i.ibb.co/sJRWx08j/Untitled-design-1.png";
                  }}
                />
             </div>
             <div className="flex flex-col leading-none relative">
                <span className="text-[10px] font-medium text-gray-400 mb-0.5 lowercase tracking-tight"></span>
                <div className="relative">
                  <span className="text-3xl font-black tracking-tighter text-white"></span>
                  {/* Smile Verde sob o nome */}
                  <div className="absolute -bottom-2 right-1 w-7 h-2.5">
                     <svg viewBox="0 0 100 40" fill="none">
                        
                     </svg>
                  </div>
                </div>
             </div>
          </div>

          {/* Selo de Pagamento Seguro */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
              <i className="fa-solid fa-lock text-sm"></i>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase tracking-tight">Pagamento</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">100% Seguro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Frete Grátis conforme Imagem */}
      <div className="bg-[#0062e3] py-3 shadow-md relative z-40">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-black text-[13px] uppercase tracking-wider mb-0.5">
            Parabéns, você ganhou frete grátis!
          </p>
          <p className="text-white text-[11px] font-medium">
            Parcele em até <span className="font-black">12x</span> nos Cartões <span className="font-black underline decoration-green-400 decoration-2">SEM juros</span>  <span className="font-black"></span>
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-6xl flex-grow">
        {cardErrorRedirect ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-white border-2 border-red-100 p-8 rounded-[1.5rem] text-center shadow-lg">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              </div>
              <h2 className="text-xl font-black text-red-700 uppercase mb-2">Ops! Cartão Indisponível</h2>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-tight">Tivemos um problema com a operadora. Utilize o PIX abaixo.</p>
            </div>
            <div className="bg-white p-8 rounded-[1.5rem] shadow-xl border border-gray-100">
              <PixPayment pixData={pixData} loading={false} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              
              {/* Passo 1: Dados Pessoais */}
              <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all ${step === 1 ? 'ring-2 ring-[#00df5e]/10' : 'opacity-100'}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs bg-[#00df5e] text-white shadow-sm shadow-[#00df5e]/30`}>
                    {step > 1 ? <i className="fa-solid fa-check"></i> : '1'}
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-[#0b1320]">Dados Pessoais</h2>
                </div>
                
                {step === 1 ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Nome Completo</label>
                      <input type="text" placeholder="Como no documento" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#00df5e] outline-none transition-all shadow-sm" value={personalData.name} onChange={e => handleInputChange('name', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                        <input type="email" placeholder="seu@email.com" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#00df5e] outline-none transition-all shadow-sm" value={personalData.email} onChange={e => handleInputChange('email', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                        <input type="text" placeholder="(00) 00000-0000" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#00df5e] outline-none transition-all shadow-sm" value={personalData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">CPF</label>
                      <input type="text" placeholder="000.000.000-00" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#00df5e] outline-none transition-all shadow-sm" value={personalData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} />
                    </div>
                    <button onClick={() => { 
                      if (personalData.name && personalData.email && personalData.cpf) setStep(2); 
                      else setError("Preencha todos os campos.");
                    }} className="w-full py-4 bg-[#00df5e] hover:bg-[#00c853] text-white font-black rounded-xl uppercase text-xs tracking-widest transition-all shadow-lg shadow-[#00df5e]/20 active:scale-[0.98]">Continuar</button>
                  </div>
                ) : (
                  <div className="text-sm ml-12 text-gray-500 font-medium bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <p className="font-bold text-[#0b1320] text-xs uppercase">{personalData.name}</p>
                    <p className="text-[10px] opacity-60 uppercase">{personalData.email} • {personalData.cpf}</p>
                  </div>
                )}
              </div>

              {/* Passo 2: Entrega */}
              <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all ${step === 2 ? 'ring-2 ring-[#00df5e]/10' : ''}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= 2 ? 'bg-[#00df5e] text-white shadow-sm shadow-[#00df5e]/30' : 'bg-gray-100 text-gray-300'}`}>
                    {step > 2 ? <i className="fa-solid fa-check"></i> : '2'}
                  </div>
                  <h2 className={`text-xs font-black uppercase tracking-widest ${step >= 2 ? 'text-[#0b1320]' : 'text-gray-300'}`}>Endereço de Entrega</h2>
                </div>
                {step === 2 && <AddressForm address={address} setAddress={setAddress} onContinue={() => setStep(3)} currentShipping={shippingPrice} setShippingPrice={setShippingPrice} />}
                {step > 2 && (
                  <div className="text-sm ml-12 text-gray-500 font-medium bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <p className="font-bold text-[#0b1320] text-xs uppercase">{address.street}, {address.number}</p>
                    <p className="text-[10px] opacity-60 uppercase">{address.city}/{address.state} • {address.zipCode}</p>
                  </div>
                )}
              </div>

              {/* Passo 3: Pagamento */}
              <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all ${step === 3 ? 'ring-2 ring-[#00df5e]/10' : ''}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step === 3 ? 'bg-[#00df5e] text-white shadow-sm shadow-[#00df5e]/30' : 'bg-gray-100 text-gray-300'}`}>
                    3
                  </div>
                  <h2 className={`text-xs font-black uppercase tracking-widest ${step === 3 ? 'text-[#0b1320]' : 'text-gray-300'}`}>Forma de Pagamento</h2>
                </div>
                {step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { setPaymentMethod(PaymentMethod.CREDIT_CARD); setError(null); setPixData(null); }} className={`p-5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === PaymentMethod.CREDIT_CARD ? 'border-[#00df5e] bg-[#00df5e]/5' : 'border-gray-100 bg-white'}`}>
                        <i className={`fa-solid fa-credit-card text-lg ${paymentMethod === PaymentMethod.CREDIT_CARD ? 'text-[#00df5e]' : 'text-gray-300'}`}></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Cartão de Crédito</span>
                      </button>
                      <button onClick={() => { setPaymentMethod(PaymentMethod.PIX); setError(null); }} className={`p-5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === PaymentMethod.PIX ? 'border-[#00df5e] bg-green-50' : 'border-gray-100 bg-white'}`}>
                        <i className={`fa-brands fa-pix text-lg ${paymentMethod === PaymentMethod.PIX ? 'text-[#00df5e]' : 'text-gray-300'}`}></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">PIX</span>
                      </button>
                    </div>

                    {paymentMethod === PaymentMethod.CREDIT_CARD ? (
                      <CreditCardForm card={card} setCard={setCard} total={total} />
                    ) : (
                      <PixPayment pixData={pixData} loading={loading} />
                    )}

                    {error && (
                      <div className="p-6 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase rounded-xl text-center space-y-4 animate-shake">
                         <div className="flex items-center justify-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> {String(error)}</div>
                         {showDemoButton && (
                            <button onClick={() => handleCheckout(true)} className="w-full py-3 bg-[#00df5e] text-white rounded-lg uppercase font-black text-[9px] tracking-widest">Finalizar Compra Agora (Modo Demo)</button>
                         )}
                      </div>
                    )}

                    {!pixData && (
                      <button onClick={() => handleCheckout(false)} disabled={loading} className={`w-full py-4 text-white font-black rounded-xl uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 ${loading ? 'bg-gray-400' : 'bg-[#00df5e] hover:bg-[#00c853] shadow-[#00df5e]/20'}`}>
                        {loading ? 'Processando...' : 'Finalizar Compra Agora'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Resumo */}
            <div className="lg:col-span-5 space-y-6 sticky top-40">
              <OrderSummary items={MOCK_ITEMS} subtotal={subtotal} shipping={shippingPrice} total={total} />
            </div>
          </div>
        )}
      </main>
      
      {/* Footer Completo Institucional */}
      <footer className="bg-white/50 border-t border-gray-200 pt-16 pb-20 mt-10 shrink-0">
         <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
               <div className="md:col-span-4 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4">Endereço</h4>
                  <p className="text-[12px] text-gray-500 font-medium">Rua Ramon de Campoamor</p>
                  <p className="text-[12px] text-gray-500 font-medium">Jardim Vista Alegre, São Paulo - SP</p>
                  <p className="text-[12px] text-gray-500 font-medium">CEP: 04831-140</p>
                  <p className="text-[12px] text-gray-400 font-bold mt-4 uppercase">CNPJ: 26.484.03/0001-43</p>
               </div>
               <div className="md:col-span-4 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4">Contato</h4>
                  <p className="text-[12px] text-[#00df5e] font-bold">suporte@bahialojas.com</p>
                  <p className="text-[12px] text-gray-500 font-medium">Atendimento: Seg à Sex, 09h às 18h</p>
               </div>
               <div className="md:col-span-4 flex md:justify-end">
                  <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-center gap-4">
                     <i className="fa-solid fa-lock text-[#0b1320] text-xl opacity-20"></i>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-[#0b1320] tracking-tight">Pagamento</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">100% SEGURO</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="mt-16 text-center border-t border-gray-100 pt-8">
               <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">© LOJAS BAHIA | TODOS OS DIREITOS RESERVADOS</p>
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 1000% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        input::placeholder { color: #cbd5e1; font-weight: 400; }
      `}</style>
    </div>
  );
};

export default App;
