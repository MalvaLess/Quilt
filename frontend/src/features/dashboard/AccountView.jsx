import { useState } from "react";
import { api } from "../../api/client";
import { useLanguage } from "../../i18n/LanguageContext";

const fieldLabel = { fontSize: 12, color: "rgba(233,233,237,0.6)", display: "block", marginBottom: 6 };
const fieldInput = { width: "100%", height: 42, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif", boxSizing: "border-box" };
const primaryPill = { display: "inline-flex", alignItems: "center", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 9, padding: "10px 18px", cursor: "pointer" };
const sectionShell = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14 };

export default function AccountView({ creator, onBack, onNameSaved, onLoggedOut }) {
  const { t } = useLanguage();
  const [name, setName] = useState(creator?.display_name || "");
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteErr, setDeleteErr] = useState(null);
  const [purgeDate, setPurgeDate] = useState(null);

  const saveName = async () => {
    try {
      await api.updateMe({ display_name: name });
      onNameSaved(name);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1500);
    } catch (e) {
      alert(e.message);
    }
  };

  const changePassword = async () => {
    setPasswordErr(null);
    setPasswordMsg(null);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMsg(t("account.passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPasswordErr(e.message);
    }
  };

  const confirmDelete = async () => {
    setDeleteErr(null);
    try {
      const res = await api.deleteAccount(deletePassword);
      setPurgeDate(new Date(res.purge_date).toLocaleDateString());
    } catch (e) {
      setDeleteErr(e.message);
    }
  };

  if (purgeDate) {
    return (
      <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{t("account.deletedMessage").replace("{date}", purgeDate)}</p>
        <div onClick={onLoggedOut} style={{ ...primaryPill, alignSelf: "flex-start" }}>
          OK
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 24 }}>
      <div onClick={onBack} style={{ fontSize: 13, color: "rgba(233,233,237,0.6)", cursor: "pointer" }}>
        {t("account.back")}
      </div>
      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 24 }}>{t("account.title")}</div>

      <div style={sectionShell}>
        <div>
          <label style={fieldLabel}>{t("account.emailLabel")}</label>
          <div style={{ fontSize: 14, color: "rgba(233,233,237,0.7)" }}>{creator?.email}</div>
        </div>
        <div>
          <label style={fieldLabel}>{t("account.nameLabel")}</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...fieldInput, flex: 1 }} />
            <div onClick={saveName} style={primaryPill}>
              {nameSaved ? t("account.nameSaved") : t("account.saveName")}
            </div>
          </div>
        </div>
      </div>

      <div style={sectionShell}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{t("account.passwordSection")}</div>
        {passwordErr && <p style={{ color: "#ff2d4f", fontSize: 13, margin: 0 }}>{passwordErr}</p>}
        {passwordMsg && <p style={{ color: "#8fe0a3", fontSize: 13, margin: 0 }}>{passwordMsg}</p>}
        <div>
          <label style={fieldLabel}>{t("account.currentPasswordLabel")}</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={fieldInput} />
        </div>
        <div>
          <label style={fieldLabel}>{t("account.newPasswordLabel")}</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={fieldInput} />
          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)", marginTop: 6 }}>{t("account.newPasswordHint")}</div>
        </div>
        <div onClick={changePassword} style={{ ...primaryPill, alignSelf: "flex-start" }}>
          {t("account.changePasswordCta")}
        </div>
      </div>

      <div style={{ ...sectionShell, border: "1px solid rgba(255,45,79,0.35)" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#ffb3c0" }}>{t("account.dangerZoneTitle")}</div>
        <div style={{ fontSize: 12, color: "rgba(233,233,237,0.6)" }}>{t("account.dangerZoneDesc")}</div>

        {!showDeleteConfirm ? (
          <div
            onClick={() => setShowDeleteConfirm(true)}
            style={{ ...primaryPill, alignSelf: "flex-start", background: "transparent", color: "#ff2d4f" }}
          >
            {t("account.deleteAccountCta")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {deleteErr && <p style={{ color: "#ff2d4f", fontSize: 13, margin: 0 }}>{deleteErr}</p>}
            <div>
              <label style={fieldLabel}>{t("account.confirmPasswordLabel")}</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={fieldInput} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div onClick={confirmDelete} style={{ ...primaryPill, background: "#ff2d4f", color: "#fff", border: "1.5px solid #ff2d4f" }}>
                {t("account.confirmDeleteCta")}
              </div>
              <div
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteErr(null);
                }}
                style={{ ...primaryPill, background: "transparent", color: "rgba(233,233,237,0.6)", border: "1px solid rgba(255,255,255,0.16)" }}
              >
                {t("account.cancelCta")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
