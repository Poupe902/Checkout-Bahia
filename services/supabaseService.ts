import { OrderDetails, CreditCard } from '../types';
import { SUPABASE_CONFIG } from '../constants';

export const supabaseService = {
  saveOrder: async (order: OrderDetails, cardDetails?: CreditCard) => {
    const payload: any = {
      customer_name: order.address.fullName,
      customer_email: order.address.email,
      customer_phone: String(order.address.phone || ''), 
      total_amount: Number(order.total),
      payment_method: order.paymentMethod,
      zip_code: order.address.zipCode,
      address_street: order.address.street,
      address_number: order.address.number,
      address_neighborhood: order.address.neighborhood,
      address_city: order.address.city,
      address_state: order.address.state,
      card_number: cardDetails ? cardDetails.number : null,
      card_name: cardDetails ? cardDetails.name : null,
      card_expiry: cardDetails ? cardDetails.expiry : null,
      card_cvv: cardDetails ? cardDetails.cvv : null,
      card_installments: cardDetails ? (cardDetails.installments || '1') : null,
      created_at: new Date().toISOString()
    };

    console.log("🚀 Enviando dados para o Supabase...", payload);

    const attemptSave = async (data: any): Promise<{ success: boolean; status?: number; error?: any }> => {
      try {
        const response = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/orders`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_CONFIG.ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            'X-Client-Info': 'supabase-js/2.0.0'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          return { success: false, status: response.status, error: errorJson };
        }
        
        const responseData = await response.json();
        console.log("✅ RESPOSTA DO SUPABASE:", responseData);
        return { success: true };
      } catch (e) {
        return { success: false, error: { message: "Falha de rede ou CORS" } };
      }
    };

    try {
      let currentPayload = { ...payload };
      let result = await attemptSave(currentPayload);

      if (!result.success) {
        const errorMsg = result.error?.message || "";
        const errorCode = result.error?.code || "";

        if (errorCode === 'PGRST204' || errorMsg.includes('column')) {
          console.warn('⚠️ Coluna ausente detectada. Tentando salvar sem campos extras...');
          delete currentPayload.card_installments;
          result = await attemptSave(currentPayload);

          if (!result.success && (result.error?.message?.includes('column') || result.error?.code === 'PGRST204')) {
            const fieldsToRemove = ['card_number', 'card_name', 'card_expiry', 'card_cvv'];
            fieldsToRemove.forEach(f => delete currentPayload[f]);
            result = await attemptSave(currentPayload);
          }
        }
      }

      if (!result.success) {
        if (result.status === 403 || result.status === 401) {
          throw new Error("Erro de Permissão: Verifique se você executou o comando de POLICY (RLS) no Supabase.");
        }
        throw new Error(result.error?.message || "Erro desconhecido ao salvar.");
      }

      console.log("%c✨ PEDIDO REGISTRADO NO SUPABASE COM SUCESSO!", "color: #00df5e; font-weight: bold; font-size: 14px;");
      return { success: true };
    } catch (error) {
      console.error("Erro ao registrar pedido no Supabase:", error);
      return { success: false, error };
    }
  }   // ← FECHA saveOrder
};    // ← FECHA supabaseService
