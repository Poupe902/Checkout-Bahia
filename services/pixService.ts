
import { INVICTUS_PAY_CONFIG } from '../constants';

export const pixService = {
  /**
   * Gera uma cobrança PIX baseada no hash da oferta selecionada.
   */
  generatePixCharge: async (
    amount: number, 
    email: string, 
    name: string, 
    cpf: string, 
    phone: string, 
    offerHash: string,
    productTitle: string
  ) => {
    try {
      const amountInCents = Math.round(amount * 100);
      const cleanCpf = cpf.replace(/\D/g, '');
      const cleanPhone = phone.replace(/\D/g, '') || '11999999999';

      if (!offerHash) {
        throw new Error("Houve um erro ao identificar a oferta selecionada.");
      }

      // Payload ajustado para os padrões de validação da API Invictus Pay
      // Incluindo product_hash em todos os níveis para evitar o erro 422 de campo obrigatório
      const payload = {
        amount: amountInCents,
        product_hash: String(offerHash), 
        offer_hash: String(offerHash),
        payment_method: "pix",
        customer: {
          name: name,
          email: email,
          phone_number: cleanPhone,
          document: cleanCpf
        },
        cart: [
          {
            title: productTitle,
            price: amountInCents,
            quantity: 1,
            product_hash: String(offerHash), // Campo obrigatório conforme erro 422
            offer_hash: String(offerHash),   // Opcional mas recomendado para precisão
            operation_type: 1,               // Inteiro para evitar erro de tipo
            tangible: true
          }
        ],
        installments: 1,
        expire_in_days: 1,
        transaction_origin: "api"
      };

      const url = `${INVICTUS_PAY_CONFIG.API_URL}/transactions?api_token=${INVICTUS_PAY_CONFIG.API_TOKEN}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (!response.ok) {
        console.error('ERRO API (Status '+response.status+'):', JSON.stringify(json, null, 2));
        
        let errorMessage = "Houve um problema ao processar o seu pagamento.";
        if (json.message && typeof json.message === 'string') {
          errorMessage = json.message;
        } else if (json.errors && typeof json.errors === 'object') {
          const firstKey = Object.keys(json.errors)[0];
          const errorField = json.errors[firstKey];
          errorMessage = Array.isArray(errorField) ? errorField[0] : String(errorField);
        }

        const lowerMsg = errorMessage.toLowerCase();
        
        // Se houver erro de validação ou erro específico de credencial/configuração
        if (
          lowerMsg.includes('hash') || 
          lowerMsg.includes('oferta') || 
          lowerMsg.includes('vendedor') || 
          lowerMsg.includes('não contém um valor válido') || 
          lowerMsg.includes('obrigatória a indicação') ||
          response.status === 422 || 
          response.status === 401 ||
          response.status === 400
        ) {
           throw new Error("CREDENTIALS_MISMATCH");
        }
        throw new Error(errorMessage.toUpperCase());
      }

      // Mapeamento extra-robusto da resposta conforme logs anteriores
      const data = json.data || json;
      const pixObj = data.pix || {};
      const paymentInfo = data.payment || data.payment_info || {};

      // Busca o código PIX prioritariamente no objeto 'pix' retornado (pix.pix_qr_code)
      const pixCode = 
        pixObj.pix_qr_code || 
        data.pix_code || 
        paymentInfo.pix_code || 
        pixObj.pix_code ||
        data.pix_qr_code_text || 
        data.pix_copy_paste || 
        "";

      // Busca a imagem QR Code ou Base64
      const pixImage = 
        pixObj.qr_code_base64 || 
        pixObj.pix_qr_code_url || 
        data.pix_qr_code_url || 
        paymentInfo.pix_qr_code_url || 
        data.pix_qr_code || 
        "";

      if (!pixCode) {
        console.error("ERRO: Resposta de sucesso mas sem código PIX detectado:", JSON.stringify(json, null, 2));
        throw new Error("CREDENTIALS_MISMATCH");
      }

      return {
        qrcode: pixCode,
        imagem_base64: pixImage || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
        id: data.hash || data.id || (json.data ? json.data.hash : json.hash)
      };
    } catch (error: any) {
      if (error instanceof Error) throw error;
      throw new Error(String(error));
    }
  },

  generateMockPix: () => {
    const mockCode = "00020101021226850014br.gov.bcb.pix0123testemockpixgalpao89520400005303986540589.905802BR5925GALPAO 896009SAO PAULO62070503***6304E2B1";
    return {
      qrcode: mockCode,
      imagem_base64: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockCode)}`,
      id: "mock_" + Math.random().toString(36).substr(2, 9)
    };
  }
};
