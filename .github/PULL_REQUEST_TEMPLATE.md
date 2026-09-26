## 🎯 Tipo de Mudança
- [ ] 🚀 Nova feature (funcionalidade sem quebra de compatibilidade)
- [x] 🐛 Correção de bug (correção que resolve um problema sem quebras)
- [ ] ⚡ Otimização de performance / refatoração
- [ ] 📝 Documentação
- [x] 🔧 CI/CD & Infraestrutura

## 📋 Descrição das Alterações
- Corrige a execução do pipeline de testes automatizados no GitHub Actions.
- Injeta as variáveis de ambiente essenciais PYTHONPATH=backend e TESTING=1 para garantir que os 88 testes do Pytest executem com sucesso e sem falso-positivos de autenticação.

## 🧪 Checklist de Verificação
- [x] Suíte de testes automatizados executada e 100% aprovada (88 passed).
- [x] Build do frontend validado com sucesso sem erros de linter ou tipagem.
- [x] Nenhuma credencial ou segredo foi exposto nos commits.
