# Relatorio de Auditoria de Seguranca: PixGo.org
## Vulnerabilidade Critica: Double Spending via Race Condition

![Banner](banner.png)

### Resumo Executivo
Durante uma auditoria de seguranca autorizada na plataforma **PixGo.org**, foi identificada uma falha critica que permite a multiplicacao de saques pendentes. A vulnerabilidade e classificada como **Race Condition** (Condicao de Corrida), resultando em um impacto financeiro severo (perda potencial de milhoes) devido a capacidade de gerar saques infinitos a partir de um unico saldo legitimo.

**Status:** Validado & Reportado  
**Severidade:** CRITICA (9.8/10)  
**Impacto:** Perda Financeira Ilimitada / Quebra de Logica Transacional

---

### Analise Tecnica

#### 1. O Gatilho: Dashboard como Hook de Liquidacao
O sistema PixGo utiliza o carregamento do dashboard (/dashboard ou api/fetch_dashboard.php) como gatilho para processar liquidacoes pendentes. 
- **Problema:** O sistema mistura uma operacao de **Leitura** (ver dashboard) com uma operacao de **Escrita Financeira** (processar pagamento) sem o uso de travas (locks) distribuidas ou controle de idempotencia.

#### 2. Causa Raiz: Falha de Atomicidade
Quando multiplas requisicoes atingem o endpoint simultaneamente:
1. **Thread A**: Consulta o saldo pendente (ex: R$ 100,00).
2. **Thread B**: Consulta o mesmo saldo pendente (R$ 100,00), pois a Thread A ainda nao concluiu a transacao.
3. **Thread A**: Inicia o envio do Payout via API de Cripto/Pix.
4. **Thread B**: Inicia outro envio de Payout para a mesma carteira.
5. **Finalizacao**: Ambas as threads marcam o saldo como "Pago" apos terem disparados os pagamentos multiplos.

**Resultado:** O usuario recebe N vezes o valor que possuia originalmente.

---

### Evidencias e Prova de Conceito (PoC)

Foi desenvolvido um script para simular um ataque de inundacao de requisicoes concorrentes, ignorando as camadas superficiais de protecao.

#### Script de Reproducao (Snippet)
```javascript
async function floodDashboard(count) {
    const url = 'https://pixgo.org/api/fetch_dashboard.php';
        const payload = 'user_id=XXXX&cargo=user';
            for (let i = 0; i < count; i++) {
                    fetch(url, {
                                method: 'POST',
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                                        body: payload
                                                                }).then(res => console.log(`Request #${i}: ${res.status}`));
                                                                    }
                                                                    }
                                                                    floodDashboard(100); // Exemplo com 100 requisicoes simultaneas
                                                                    ```
                                                                    
