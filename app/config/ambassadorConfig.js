export const ambassadorConfig = {
  minimumSpend: 800,
  customerDiscountPercentage: 10,
  ambassadorCreditPercentage: 3,
  metafield: {
    namespace: 'custom',
    key: 'embaixador_alcimo',
    type: 'json',
  },
  levels: [
    {id: 'bronze', label: 'Bronze', minimumConfirmedSales: 0},
    {id: 'silver', label: 'Prata', minimumConfirmedSales: 20},
    {id: 'gold', label: 'Ouro', minimumConfirmedSales: 50},
    {id: 'diamond', label: 'Diamante', minimumConfirmedSales: 100},
  ],
};

export default ambassadorConfig;
