/* Tela de entrada: senha mestra ou código secreto (PIN). */
import * as vault from "../vault.js";
import { appName, getConfig, resetConfig } from "../settings.js";
import { APP_VERSION } from "../version.js";
import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { passwordField } from "../ui/password-field.js";
import { askSecret, sheet, confirmDlg } from "../ui/dialog.js";
import { installApp, isInstalled } from "../ui/install.js";
import { toast } from "../ui/toast.js";

export async function render({ app }) {
  const discreet = getConfig().discreet;
  const pw = passwordField({ placeholder: "Senha mestra", autocomplete: "current-password", label: "" });
  pw.input.setAttribute("aria-label", "Senha mestra");
  const err = h("p", { class: "form-erro", role: "alert" });
  const btn = h("button", { type: "submit", class: "btn btn-primary btn-xl" }, h("span", { class: "btn-circle" }, icon("chevron")), "Entrar");

  if (app.state.notice) {
    const n = app.state.notice;
    app.state.notice = null;
    setTimeout(() => toast(n), 50);
  }

  const enterWithCode = async () => {
    if (!(await vault.hasPin())) {
      await sheet({
        title: "Entrar com código ou QR",
        icon: h("div", { class: "sheet-ic" }, icon("qr")),
        text: "O código secreto ainda não foi criado. Entre com a senha mestra e crie o código em Perfil › Código secreto. A entrada por QR Code chega em breve.",
        actions: [{ label: "Entendi", value: true, kind: "primary" }],
      });
      return;
    }
    let ok = false;
    await askSecret("Código secreto", "Digite seu código de números.", {
      label: "Código",
      pin: true,
      ok: "Entrar",
      validate: async (pin) => {
        const r = await vault.unlockWithPin(pin);
        if (r.ok) { ok = true; return ""; }
        if (r.reason === "wrong") return `Código errado. Restam ${r.left} tentativa${r.left === 1 ? "" : "s"}.`;
        return "Código bloqueado por segurança. Entre com a senha mestra e crie um novo código.";
      },
    });
    if (ok) app.onUnlocked();
  };

  const forgot = async () => {
    await sheet({
      title: "Esqueci a senha mestra",
      text: "Por segurança, a senha mestra não fica guardada em lugar nenhum e não pode ser recuperada. Se você tem o código secreto, use “Entrar com código”. Sem a senha, a única saída é apagar tudo e começar de novo (e importar um backup, se tiver).",
      actions: [
        { label: "Voltar", value: null },
        { label: "Apagar tudo", value: "wipe", kind: "danger" },
      ],
      onSubmit: async () => {
        const sure = await confirmDlg("Apagar todos os dados?", "Todas as senhas guardadas neste aparelho serão apagadas. Isso não pode ser desfeito.", { ok: "Sim, apagar tudo", danger: true });
        if (sure) {
          await vault.wipe();
          resetConfig();
          app.render();
          toast("Dados apagados. Crie uma nova senha mestra.");
        }
        return true;
      },
    });
  };

  const node = h(
    "form",
    {
      class: "auth auth-login",
      autocomplete: "off",
      onsubmit: async (e) => {
        e.preventDefault();
        err.textContent = "";
        if (!pw.input.value) { err.textContent = "Digite sua senha mestra."; pw.input.focus(); return; }
        btn.disabled = true;
        const ok = await vault.unlock(pw.input.value);
        if (ok) {
          pw.input.value = "";
          app.onUnlocked();
          return;
        }
        await new Promise((r) => setTimeout(r, 600));
        btn.disabled = false;
        err.textContent = "Senha incorreta. Tente de novo.";
        pw.input.select();
        pw.input.focus();
      },
    },
    discreet
      ? h("span", { class: "auth-ic" }, icon("note"))
      : h("img", { src: "assets/img/logo.png", alt: "", class: "auth-logo", width: "120", height: "145" }),
    h("h1", { class: "auth-brand", text: appName() }),
    pw.el,
    err,
    btn,
    h("button", { type: "button", class: "btn btn-outline btn-lg", onclick: enterWithCode }, icon("qr"), "Entrar com código ou QR"),
    h("p", { class: "auth-foot" }, icon("shield"), "Seguro, simples e fácil de usar"),
    h(
      "div",
      { class: "auth-links" },
      h("button", { type: "button", class: "link-btn", onclick: forgot }, "Esqueci a senha"),
      isInstalled() ? null : h("button", { type: "button", class: "link-btn", onclick: installApp }, "Instalar app")
    ),
    h("p", { class: "auth-version", text: `v${APP_VERSION}` })
  );
  return { node, title: "Entrar", focus: () => pw.input.focus() };
}
