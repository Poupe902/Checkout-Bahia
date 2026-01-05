
export const FREE_SHIPPING_THRESHOLD = 0;

/**
 * Ajustado para R$ 9,90 conforme solicitado pelo usuário.
 * Total com frete pago: 89,90 + 9,90 = R$ 99,80.
 */
export const STANDARD_SHIPPING_PRICE = 9.90;

export const MOCK_ITEMS = [
  {
    id: 'ecolock-kit-24',
    name: 'Kit 24 Potes Herméticos Ecolock - Organizador Premium',
    price: 89.90,
    quantity: 1,
    image: 'https://images.tcdn.com.br/img/editor/up/1118685/potes_24.png' 
  }
];

/**
 * --- CONFIGURAÇÃO INVICTUS PAY ---
 * Hashes oficiais fornecidos pelo usuário.
 */
export const INVICTUS_PAY_CONFIG = {
  API_URL: 'https://api.invictuspay.app.br/api/public/v1', 
  API_TOKEN: 'IYCoH1R6LnB5POVuv5LTKwc9uyER0IPVcY9SrSSKU5fC0E1XauTIFRAMKF50', 
  
  OFFERS: {
    // Hash da oferta de R$ 89,90
    FREE_SHIPPING: 'gmvowuyoib', 
    
    // Hash da oferta de R$ 99,80 (conforme ajuste de frete para 9,90)
    PAID_SHIPPING: 'eg80sxxph4', 
  },
  
  ALLOW_TEST_MODE: true, 
};

export const SUPABASE_CONFIG = {
  URL: 'https://rckqhortwgtztkcyqvik.supabase.co',
  ANON_KEY: 'sb_publishable_C9OsSGE54AbAP2mkd9QWrw_Jyg1qYG1'
};
