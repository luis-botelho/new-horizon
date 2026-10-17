# ADR 0002: Pool de Capital atrás de feature flag

**Status:** aceita

Captar dinheiro de investidores para financiar operadores pode caracterizar contrato de investimento coletivo (regulado pela CVM). Tokens com expectativa de retorno agravam o enquadramento.

**Decisão:** o módulo existe apenas como casca (`RiskNotice`) e a rota responde 404 enquanto `NEXT_PUBLIC_FEATURE_INVESTOR_POOL` for `false`. Nenhuma tela de aporte é construída antes de parecer de advogado de mercado de capitais.
