# Changelog

Todas as mudanças importantes do KeyPass ficam registradas aqui.
Cada versão validada recebe uma tag no Git (ex.: `v0.1.0`).

## [0.1.0] — 2026-10-11

Primeira versão (MVP) publicada no GitHub Pages.

### Adicionado
- PWA instalável (manifest, ícones normais e "maskable", ícone para iPhone) que funciona offline (service worker com rede primeiro e aviso de nova versão).
- Primeiro uso: criação da senha mestra com confirmação e indicador de força.
- Cofre cifrado: chave derivada com PBKDF2-SHA256 (310.000 iterações, sal aleatório) e dados cifrados com AES-GCM (IV novo a cada gravação) no IndexedDB. A senha mestra nunca é gravada.
- Bloqueio automático por inatividade (1, 5 ou 15 min; padrão 5) e ao deixar o app em segundo plano por mais de 1 minuto. Botão "Bloquear agora".
- Código secreto (PIN de 4 a 8 números) para entrar mais rápido, com limite de 5 tentativas (depois só com a senha mestra).
- Tela inicial com categorias grandes: Banco, Email, Redes Sociais, Compras, Saúde e Outros.
- Cadastro de acessos (nome, link, usuário, senha, categoria e observação), edição, exclusão com confirmação e busca.
- Botões grandes de Copiar Senha, Copiar Usuário e Abrir Site; senha escondida por padrão e revelada por 10 segundos; área de transferência limpa após 30 segundos (melhor esforço).
- Gerador de senhas (4 a 32 caracteres; letras, números e símbolos) com "Copiar" e "Usar".
- Backup manual: exportar arquivo JSON cifrado com a senha mestra e importar (juntar ou substituir).
- Apagamento automático opcional depois de 7, 15 ou 30 dias sem abrir o app.
- Modo discreto: troca o nome exibido no app e na aba por um nome comum (padrão "Notas").
- Temas: verde clarinho, alto contraste e escuro.
- Layout responsivo para celular, tablet e computador.

### Ainda não incluído
- Entrada por QR Code (aparece como "em breve").
- Troca do ícone/nome do app instalado (limitação do PWA).
