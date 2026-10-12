# KeyPass

Caderno de senhas **simples, discreto e seguro**, feito como PWA (funciona offline e pode ser instalado no celular e no computador). Pensado para quem tem pouca familiaridade com tecnologia: letras grandes, botões grandes, cores suaves e pouco texto.

**Abrir o app:** https://viniciusjrcarlos.github.io/keypass/

> Seus dados **nunca** vão para o GitHub nem para servidor nenhum. Tudo fica cifrado, só no navegador do aparelho onde você usa o app.

## Funcionalidades (v0.1.0)

| Área | O que faz |
|---|---|
| Entrada | Senha mestra (criada no primeiro uso) ou código secreto (PIN). QR Code: em breve. |
| Categorias | Banco, Email, Redes Sociais, Compras, Saúde e Outros, com botões grandes. |
| Acessos | Adicionar, ver, editar, excluir e buscar. Copiar senha, copiar usuário e abrir o site. |
| Gerador | Senhas de 4 a 32 caracteres com letras, números e símbolos. "Usar" já preenche uma nova senha. |
| Segurança | Cofre cifrado, bloqueio automático, senha escondida por padrão, limpeza da área de transferência. |
| Discrição | Nome discreto (ex.: "Notas"), código secreto e apagamento automático após 7/15/30 dias sem abrir. |
| Backup | Exporta um arquivo cifrado e importa (juntar ou substituir). |
| Aparência | Verde clarinho, alto contraste ou escuro. Responsivo para celular, tablet e PC. |

## Como a segurança funciona

- **Senha mestra → chave:** PBKDF2-SHA256 com 310.000 iterações e sal aleatório (Web Crypto API do navegador).
- **Chave do cofre:** uma chave aleatória de 256 bits cifra todos os acessos com **AES-GCM** (IV aleatório novo a cada gravação). Essa chave fica guardada "embrulhada" (cifrada) pela chave da senha mestra.
- **Onde fica:** só o texto cifrado vai para o **IndexedDB** do navegador. A senha mestra e o PIN **nunca** são gravados. Preferências não sensíveis (tema, modo discreto, tempos) ficam no `localStorage`.
- **Em memória:** a chave do cofre só existe enquanto o app está aberto. Ela é apagada ao bloquear (inatividade de 5 min por padrão, ou app em segundo plano por mais de 1 min).
- **Na tela:** senhas aparecem mascaradas e só são reveladas por alguns segundos. Ao copiar, o app tenta limpar a área de transferência depois de 30 s (o navegador só permite isso com a página em foco).
- **Código secreto (PIN):** é uma segunda cópia da chave do cofre, cifrada com uma chave derivada do PIN (PBKDF2). Depois de 5 erros seguidos essa cópia é apagada e só a senha mestra abre o app. Atenção: um PIN curto é mais fácil de adivinhar do que a senha mestra para quem tiver acesso ao aparelho destravado e conhecimento técnico; use-o como atalho de conveniência.
- **Apagamento automático:** conta os **dias sem abrir (desbloquear) o app**, não dias sem internet, porque o app funciona 100% offline. Se o limite configurado (7, 15 ou 30 dias) passar, os dados são apagados ao abrir. Vem **desligado** por padrão; faça backup antes de ligar.
- **Backup:** o arquivo `.json` exportado contém só dados cifrados (AES-GCM com chave PBKDF2 da senha mestra no momento da exportação, sal e IV próprios, versão do formato). Para importar é preciso a senha usada na exportação.
- **Página:** Content-Security-Policy restrita (sem scripts de terceiros, sem CDN), e nenhum dado do usuário é inserido como HTML.
- **Esqueceu a senha mestra?** Não há recuperação. Só é possível apagar tudo e começar de novo (importando um backup, se tiver).

### Modo discreto
Troca o nome exibido dentro do app e na aba do navegador por um nome comum (padrão "Notas") e usa um ícone genérico no topo. O **nome e o ícone do app instalado** na tela inicial vêm do `manifest.webmanifest` e **não podem ser trocados dinamicamente** por um PWA; para isso seria preciso publicar outra versão com outro manifest.

## Instalar como app
- **Android / PC (Chrome ou Edge):** abra o link e use "Instalar app" (no app em Perfil › Instalar app, ou no menu do navegador).
- **iPhone (Safari):** botão Compartilhar › "Adicionar à Tela de Início".

Depois de aberto uma vez com internet, funciona sem conexão. Quando há internet, a versão nova é baixada e o app mostra "Nova versão disponível · Atualizar".

## Estrutura do projeto

```
index.html               casca do app (CSP, manifest, navegação)
manifest.webmanifest     dados do PWA (nome, ícones, cores)
sw.js                    service worker (offline, rede primeiro, versão do cache)
css/
  tokens.css             cores e medidas (3 temas por variáveis CSS)
  base.css               estrutura, topo, menu inferior, responsividade
  components.css         botões, campos, cartões, interruptor, aviso, diálogos
  screens.css            estilos de cada tela
js/
  boot.js                aplica o tema antes de desenhar (evita "piscar")
  app.js                 roteador, bloqueio automático, apagamento automático, SW
  version.js             versão exibida no app
  crypto.js              PBKDF2 + AES-GCM (Web Crypto)
  db.js                  IndexedDB (chave/valor)
  vault.js               cofre: criar, abrir, PIN, trocar senha, CRUD, importar
  auth.js                regras e força da senha mestra / PIN
  generator.js           gerador de senhas (crypto.getRandomValues)
  backup.js              exportar / importar backup cifrado
  settings.js            preferências, temas, regra do apagamento automático
  categories.js          categorias fixas
  ui/                    dom (h/esc), ícones SVG, toast, diálogos, campo de senha,
                         área de transferência, instalar app
  screens/               setup, login, home, lista, detalhe, form, gerador, perfil
assets/img/              logo e ilustração (recortados dos mockups)
icons/                   ícones do PWA (192, 512, maskable, apple-touch)
docs/mockups/            mockups originais e PDF do projeto (só referência, não publicados)
.github/workflows/       publicação automática no GitHub Pages
```

Sem build e sem dependências: HTML, CSS e JavaScript puro com módulos ES.

## Rodar localmente

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```
(O Web Crypto e o service worker exigem `https` ou `localhost`.)

## Versões e como voltar se der problema

- Cada versão **validada** recebe uma **tag** anotada (`v0.1.0`, `v0.2.0`…) e uma Release no GitHub, com o resumo no `CHANGELOG.md`.
- Ao lançar uma versão nova, atualize juntos: `js/version.js`, `CACHE` em `sw.js` (ex.: `keypass-v0.2.0`) e o `CHANGELOG.md`.
- Todo push na `main` publica automaticamente no GitHub Pages.
- **Para voltar a uma versão validada (rollback):**
  1. No GitHub, abra **Actions › Publicar no GitHub Pages › Run workflow**.
  2. Em "Tag ou commit para publicar", digite a tag boa (ex.: `v0.1.0`) e rode.
  3. O site volta para aquela versão sem mexer no histórico. Depois corrija o problema na `main` (por exemplo com `git revert`) e publique de novo.
  Pelo terminal: `gh workflow run pages.yml -f ref=v0.1.0`.
- Nunca usamos `push --force`: o histórico fica sempre preservado.

## Dados de teste
O repositório não tem nenhuma senha, login ou dado pessoal. Para testar, crie uma senha mestra qualquer e cadastre dados fictícios.

---
© 2026 Vinicius Carlos. Veja `LICENSE`.
