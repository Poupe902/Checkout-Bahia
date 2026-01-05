
import React from 'react';
import { OrderItem } from '../types';

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, subtotal, shipping, total }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-sm border border-gray-100">
        <h2 className="text-[11px] font-black text-[#0b1320] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <i className="fa-solid fa-cart-shopping text-[#00df5e]"></i>
          Resumo do pedido
        </h2>
        
        <div className="space-y-6 mb-8">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-contain transform hover:scale-110 transition-transform duration-300" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.ibb.co/sJRWx08j/Untitled-design-1.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed line-clamp-2 mb-2">
                  {item.name}
                </h3>
                <div className="flex items-baseline gap-1">
                   <span className="text-[12px] font-black text-[#0b1320]">R$</span>
                   <span className="text-lg font-black text-[#0b1320] tracking-tighter">
                     {item.price.toFixed(2).replace('.', ',')}
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-50 pt-6 space-y-4">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-gray-900 font-black">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Frete</span>
            {shipping === 0 ? (
              <span className="text-[#00df5e] font-black bg-green-50 px-2 py-0.5 rounded border border-green-100">GRÁTIS</span>
            ) : (
              <span className="text-gray-900 font-black">R$ {shipping.toFixed(2).replace('.', ',')}</span>
            )}
          </div>
          <div className="flex justify-between items-center pt-5 border-t border-gray-100">
            <span className="text-[13px] font-black text-[#0b1320] uppercase tracking-tighter">Total</span>
            <div className="text-right">
               <div className="flex items-baseline justify-end gap-1 text-[#0b1320]">
                  <span className="text-[14px] font-black">R$</span>
                  <span className="text-2xl font-black tracking-tighter">{total.toFixed(2).replace('.', ',')}</span>
               </div>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Ou em até 12x no cartão</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selos de Confiança */}
      <div className="space-y-3">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 group hover:border-[#00df5e]/30 transition-colors">
          <div className="w-10 h-10 bg-blue-50/50 rounded-xl flex items-center justify-center shrink-0">
             <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png" className="w-6 h-6 object-contain" alt="MP" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-[#0b1320] uppercase tracking-widest">Mercado Pago</h4>
            <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5">Pagamento 100% processado pelo Mercado Pago.</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 group hover:border-[#00df5e]/30 transition-colors">
          <div className="w-10 h-10 bg-green-50/50 rounded-xl flex items-center justify-center text-[#00df5e] shrink-0">
            <i className="fa-solid fa-shield-heart text-lg"></i>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-[#0b1320] uppercase tracking-widest">Satisfação Garantida</h4>
            <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5">7 dias para trocas ou devoluções sem custos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
