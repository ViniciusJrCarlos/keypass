/* Perfil / configurações: segurança, discrição, backup, aparência e sobre. */
import * as vault from "../vault.js";
import * as backup from "../backup.js";
import { getConfig, setConfig, THEMES, getTheme, setTheme, resetConfig } from "../settings.js";
import { masterProblem, pinProblem, strength } from "../auth.js";
import { APP_VERSION } from "../version.js";
import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { askSecret, confirmDlg, sheet, chooseDlg, alertDlg } from "../ui/dialog.js";
import { passwordField } from "../ui/password-field.js";
import { toast } from "../ui/toast.js";
import { installApp, isInstalled } from "../ui/install.js";

const checkMaster = async (v) => ((await vault.verifyMaster(v)) ? "" : "Senha mestra incorreta.");

function select(options, value, onChange, label) {
  const s = h("select", { class: "input select select-sm", "aria-label": label }, options.map(([v, t]) => h("option", { value: String(v), text: t })));
  s.value = String(value);
  s.addEventListener("change", () => onChange(s.value, s));
  return s;
}

function item({ ic, title, sub, control, onClick, danger }) {
  const inner = [
    h("span", { class: "set-ic" + (danger ? " danger" : "") }, icon(ic)),
    h("span", { class: "set-txt" }, h("span", { class: "set-title", text: title }), sub ? h("span", { class: "set-sub", text: sub }) : null),
    control ? h("span", { class: "set-control" }, control) : onClick ? h("span", { class: "set-chev" }, icon("chevron")) : null,
  ];
  return onClick
    ? h("button", { type: "button", class: "set-item" + (danger ? " danger" : ""), onclick: onClick }, inner)
    : h("div", { class: "set-item" + (control ? " has-control" : "") }, inner);
}

/** Pede dois valores iguais (nova senha / novo código). */
async function askNew({ title, text, label, pin }) {
  const a = passwordField({ label, pin, autocomplete: pin ? "off" : "new-password" });
  const b = passwordField({ label: "Repita para confirmar", pin, autocomplete: pin ? "off" : "new-password" });
  const err = h("p", { class: "form-erro", role: "alert" });
  const hint = h("p", { class: "muted small", text: " " });
  if (!pin) a.input.addEventListener("input", () => { hint.textContent = a.input.value ? `Força: ${strength(a.input.value).label}` : " "; });
  let value = null;
  const r = await sheet({
    title,
    text,
    body: h("div", { class: "sheet-body" }, a.el, pin ? null : hint, b.el, err),
    actions: [{ label: "Cancelar", value: null }, { label: "Salvar", value: "ok", kind: "primary" }],
    onSubmit: () => {
      const m = pin ? pinProblem(a.input.value, b.input.value) : masterProblem(a.input.value, b.input.value);
      if (m) { err.textContent = m; return false; }
      value = a.input.value;
      return true;
    },
  });
  a.input.value = b.input.value = "";
  return r ? value : null;
}

export async function render({ app }) {
  const cfg = getConfig();
  const meta = await vault.getMeta();
  const pinOn = !!(meta && meta.pin);
  const rerender = () => app.render();

  /* --- Apagar dados após X dias sem abrir --- */
  const wipe = item({
    ic: "clock",
    title: "Apagar dados se ficar sem abrir",
    sub: cfg.wipeDays
      ? `Tudo será apagado se o app ficar ${cfg.wipeDays} dias sem ser aberto. Faça backup!`
      : "Protege seus dados apagando tudo se o app ficar muitos dias sem ser aberto.",
    control: select([[0, "Desligado"], [7, "7 dias"], [15, "15 dias"], [30, "30 dias"]], cfg.wipeDays, async (v, s) => {
      const days = Number(v);
      if (days) {
        const ok = await confirmDlg(
          "Ligar o apagamento automático?",
          `Se você não abrir o KeyPass por ${days} dias, todas as senhas deste aparelho serão apagadas. Conta os dias sem abrir o app (não precisa de internet). Recomendamos exportar um backup antes.`,
          { ok: "Ligar" }
        );
        if (!ok) { s.value = String(cfg.wipeDays); return; }
      }
      setConfig({ wipeDays: days });
      toast(days ? `Apagamento após ${days} dias ligado.` : "Apagamento automático desligado.");
      rerender();
    }, "Apagar dados após"),
  });

  /* --- Nome discreto --- */
  const discreet = item({
    ic: "mask",
    title: "Nome discreto do app",
    sub: cfg.discreet ? `Ligado: aparece como “${cfg.discreetName}”.` : "Mostra um nome comum no lugar de “KeyPass”, para mais discrição.",
    onClick: async () => {
      const input = h("input", { class: "input", value: cfg.discreetName || "Notas", maxlength: "24", autocomplete: "off" });
      const err = h("p", { class: "form-erro", role: "alert" });
      const r = await sheet({
        title: "Nome discreto",
        text: "Escolha um nome comum para aparecer no app e na aba do navegador. O nome do ícone instalado na tela inicial não muda.",
        body: h("div", { class: "sheet-body" }, h("label", { class: "field" }, h("span", { class: "field-label", text: "Nome" }), input), err),
        actions: [
          { label: cfg.discreet ? "Desligar" : "Cancelar", value: cfg.discreet ? "off" : null },
          { label: "Salvar e ligar", value: "on", kind: "primary" },
        ],
        onSubmit: (v) => {
          if (v === "on" && !input.value.trim()) { err.textContent = "Digite um nome."; return false; }
          return true;
        },
      });
      if (r === "on") { setConfig({ discreet: true, discreetName: input.value.trim().slice(0, 24) }); toast("Modo discreto ligado."); }
      else if (r === "off") { setConfig({ discreet: false }); toast("Modo discreto desligado."); }
      else return;
      rerender();
    },
  });

  /* --- Código secreto (PIN) --- */
  const createPin = async () => {
    const master = await askSecret("Confirme sua senha mestra", "Para criar o código secreto, digite a senha mestra.", { validate: checkMaster });
    if (!master) return;
    const pin = await askNew({ title: "Novo código secreto", text: "Use de 4 a 8 números. Depois de 5 erros, o código é desligado e só a senha mestra abre o app.", label: "Código", pin: true });
    if (!pin) return;
    await vault.setPin(master, pin);
    toast("Código secreto criado!");
    rerender();
  };
  const pinItem = item({
    ic: "lock",
    title: "Código secreto para abrir",
    sub: pinOn ? "Ligado. Use “Entrar com código” na tela de entrada." : "Um código de números para abrir o app mais rápido.",
    onClick: async () => {
      if (!pinOn) return createPin();
      const v = await chooseDlg("Código secreto", "O que você quer fazer?", [
        { label: "Trocar código", value: "change", kind: "soft" },
        { label: "Remover código", value: "remove", kind: "soft" },
      ]);
      if (v === "change") return createPin();
      if (v === "remove") {
        if (await confirmDlg("Remover o código?", "Depois disso, o app só abre com a senha mestra.", { ok: "Remover", danger: true })) {
          await vault.removePin();
          toast("Código removido.");
          rerender();
        }
      }
    },
  });

  /* --- Bloqueio automático --- */
  const lockItem = item({
    ic: "clock",
    title: "Bloquear sozinho",
    sub: "Pede a senha de novo depois de um tempo sem usar.",
    control: select([[1, "1 min"], [5, "5 min"], [15, "15 min"]], cfg.lockMinutes, (v) => { setConfig({ lockMinutes: Number(v) }); toast("Tempo de bloqueio salvo."); }, "Bloquear após"),
  });

  /* --- Trocar senha mestra --- */
  const changeMaster = item({
    ic: "key",
    title: "Trocar senha mestra",
    onClick: async () => {
      const cur = await askSecret("Senha atual", "Digite sua senha mestra atual.", { validate: checkMaster });
      if (!cur) return;
      const next = await askNew({ title: "Nova senha mestra", text: "Mínimo de 8 caracteres. Anote em lugar seguro.", label: "Nova senha mestra" });
      if (!next) return;
      await vault.changeMaster(cur, next);
      toast("Senha mestra trocada!");
    },
  });

  /* --- Backup --- */
  const fileInput = h("input", { type: "file", accept: "application/json,.json", class: "sr-only", tabindex: "-1", "aria-hidden": "true" });
  fileInput.addEventListener("change", async () => {
    const f = fileInput.files && fileInput.files[0];
    fileInput.value = "";
    if (!f) return;
    let obj;
    try { obj = await backup.readFile(f); } catch (e) { alertDlg("Não deu para abrir", e.message); return; }
    let list = null;
    const pw = await askSecret("Senha do backup", "Digite a senha mestra que estava em uso quando o backup foi feito.", {
      label: "Senha do backup",
      ok: "Abrir backup",
      validate: async (v) => { list = await backup.decryptBackup(obj, v); return list ? "" : "Senha incorreta para este backup."; },
    });
    if (!pw || !list) return;
    const mode = await chooseDlg("Importar backup", `O arquivo tem ${list.length} senha${list.length === 1 ? "" : "s"}. Como você quer importar?`, [
      { label: "Juntar com as atuais", value: "merge", kind: "soft" },
      { label: "Substituir tudo", value: "replace", kind: "soft" },
    ]);
    if (!mode) return;
    if (mode === "replace" && !(await confirmDlg("Substituir tudo?", "As senhas atuais deste aparelho serão trocadas pelas do backup.", { ok: "Substituir", danger: true }))) return;
    const n = await vault.importEntries(list, mode);
    toast(`${n} senha${n === 1 ? "" : "s"} importada${n === 1 ? "" : "s"}!`);
    rerender();
  });

  const exportItem = item({
    ic: "download",
    title: "Exportar backup",
    sub: "Salva um arquivo protegido. Ele só abre com sua senha mestra.",
    onClick: async () => {
      let data = null;
      const pw = await askSecret("Exportar backup", "Digite a senha mestra para proteger o arquivo.", {
        ok: "Exportar",
        validate: async (v) => { data = await backup.buildBackup(v); return data ? "" : "Senha mestra incorreta."; },
      });
      if (!pw || !data) return;
      backup.download(data);
      setConfig({ lastBackup: Date.now() });
      toast("Backup salvo nos seus downloads.");
    },
  });
  const importItem = item({ ic: "upload", title: "Importar backup", sub: "Traz as senhas de um arquivo de backup do KeyPass.", onClick: () => fileInput.click() });

  /* --- Aparência --- */
  const themeItem = item({
    ic: "palette",
    title: "Cores do app",
    control: select(Object.entries(THEMES).map(([k, t]) => [k, t.label]), getTheme(), (v) => setTheme(v), "Cores do app"),
  });

  /* --- App --- */
  const appItems = [
    isInstalled() ? null : item({ ic: "phone", title: "Instalar app", sub: "Use como aplicativo no celular ou no computador.", onClick: installApp }),
    item({ ic: "logout", title: "Bloquear agora", onClick: () => app.lockNow("App bloqueado.") }),
    item({
      ic: "trash",
      title: "Apagar tudo deste aparelho",
      danger: true,
      onClick: async () => {
        const pw = await askSecret("Apagar tudo", "Digite a senha mestra para apagar todas as senhas deste aparelho. Isso não pode ser desfeito.", { ok: "Continuar", validate: checkMaster });
        if (!pw) return;
        if (!(await confirmDlg("Tem certeza?", "Todas as senhas serão apagadas para sempre.", { ok: "Apagar tudo", danger: true }))) return;
        await vault.wipe();
        resetConfig();
        app.render();
        toast("Tudo apagado.");
      },
    }),
  ];

  const lastBackup = cfg.lastBackup ? new Date(cfg.lastBackup).toLocaleDateString("pt-BR") : "nunca";

  const node = h(
    "section",
    { class: "screen settings" },
    h("h2", { class: "screen-title", text: "Configurações" }),
    h("h3", { class: "set-group", text: "Segurança" }),
    h("div", { class: "card set-card" }, wipe, discreet, pinItem, lockItem, changeMaster),
    h("h3", { class: "set-group", text: "Backup" }),
    h("div", { class: "card set-card" }, exportItem, importItem, fileInput),
    h("p", { class: "muted small pad", text: `Último backup neste aparelho: ${lastBackup}.` }),
    h("h3", { class: "set-group", text: "Aparência e app" }),
    h("div", { class: "card set-card" }, themeItem, appItems),
    h("div", { class: "safe-note" }, icon("shield"),
      h("p", {},
        h("strong", { text: "Seus dados. Sempre protegidos. " }),
        `Tudo fica só neste aparelho, cifrado. ${vault.entries().length} senha(s) guardada(s).`)),
    h("p", { class: "auth-version", text: `KeyPass v${APP_VERSION}` })
  );
  return { node, title: "Configurações", nav: "perfil", header: { sub: "Perfil" } };
}
