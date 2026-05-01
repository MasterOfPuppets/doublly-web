export function BetaTestersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beta-testers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Espaço de apoio aos testes beta. Esta página pode evoluir para Help no futuro.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Sobre o sistema e o que estamos a validar</h2>

        <p className="mt-3 text-sm leading-6 text-gray-700">
          O Doublly organiza a gestão financeira por projetos, com contas e subcontas em árvore.
          Em cada conta podes definir orçamento, registar movimentos e acompanhar o total gasto e o valor restante.
          Nesta fase beta, estamos a validar usabilidade, velocidade de operação e consistência visual dos fluxos principais.
        </p>

        <h3 className="mt-6 text-sm font-semibold text-gray-900">Como dar feedback</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
          <li>Usa o botão de feedback visível na app.</li>
          <li>Explica o que estavas a fazer e o que esperavas que acontecesse.</li>
          <li>Se houver erro, inclui o comportamento observado e os passos para reproduzir.</li>
        </ul>

        <h3 className="mt-6 text-sm font-semibold text-gray-900">Backlog</h3>

        <h4 className="mt-4 text-sm font-semibold text-gray-900">Estabilidade e UX atual</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
          <li>Sistema global de mensagens de sucesso, erro e aviso.</li>
          <li>Mensagens mais claras nos modais em vez de erro genérico.</li>
          <li>Rever atualização de dados após ações para evitar informação desatualizada.</li>
        </ul>

        <h4 className="mt-4 text-sm font-semibold text-gray-900">Conta, login e onboarding</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
          <li>Adicionar registo com email/password para novos utilizadores.</li>
        </ul>

        <h4 className="mt-4 text-sm font-semibold text-gray-900">Orçamento e visualização financeira</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
          <li>Escolha por projeto entre modo restante e modo desvio.</li>
          <li>Resumo em ramos colapsados com totais e contagens.</li>
        </ul>

        <h4 className="mt-4 text-sm font-semibold text-gray-900">Produtividade de movimentos</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
          <li>Ordenação de movimentos por conta (data, alfabética e manual).</li>
          <li>Criar movimento a partir de fatura/talão por foto (v2).</li>
          <li>Estado do movimento com histórico de transições.</li>
        </ul>

        <h4 className="mt-4 text-sm font-semibold text-gray-900">Evolução funcional</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
          <li>Movimentos recorrentes.</li>
          <li>Metas de poupança.</li>
          <li>Relatórios e gráficos.</li>
          <li>Partilha de projeto.</li>
          <li>Reconciliação de conta.</li>
          <li>Alertas e notificações.</li>
        </ul>

        <h4 className="mt-4 text-sm font-semibold text-gray-900">Templates de projeto</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
          <li>Sistema de templates para acelerar a criação de novos projetos.</li>
        </ul>
      </section>
    </div>
  )
}