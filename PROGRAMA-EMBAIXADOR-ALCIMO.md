# Programa Embaixador ALCIMO

## Rota

`/account/ambassador`

## Metafield necessário no Shopify Admin

Crie uma definição de metafield para **Cliente** com acesso de leitura e gravação pela Customer Account API:

- Nome: Embaixador ALCIMO
- Namespace e chave: `custom.embaixador_alcimo`
- Tipo: JSON
- Acesso da Customer Account API: leitura e gravação

A solicitação inicial é salva como:

```json
{
  "status": "pending",
  "requestedAt": "2026-07-31T00:00:00.000Z",
  "customerDiscountPercentage": 10,
  "ambassadorCreditPercentage": 3
}
```

Para liberar manualmente o dashboard durante os testes, altere `status` para `approved` e acrescente, quando desejar:

```json
{
  "status": "approved",
  "coupon": "PAULO10",
  "level": "Bronze",
  "availableCredit": 0,
  "pendingCredit": 0,
  "confirmedSales": 0,
  "totalSold": 0
}
```

## Configuração central

As regras iniciais ficam em:

`app/config/ambassadorConfig.js`

O valor mínimo está configurado em R$ 800, o desconto do comprador em 10% e o crédito do embaixador em 3%.
