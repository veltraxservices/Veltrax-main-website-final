import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Plus, Trash2, Pencil, X, ArrowUpRight, MessageSquare, Settings as SettingsIcon, LayoutGrid } from "lucide-react";
import { api, formatApiError } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const TABS = [
  { id: "settings", label: "Links", Icon: SettingsIcon },
  { id: "portfolio", label: "Portfolio", Icon: LayoutGrid },
  { id: "messages", label: "Messages", Icon: MessageSquare },
];

const initialItem = {
  title: "",
  title_en: "",
  category: "",
  category_en: "",
  description: "",
  description_en: "",
  image_url: "",
  metric_before: "",
  metric_after: "",
  tags: "",
  order: 0,
};

const AdminDashboardPage = () => {
  const { user, bootstrapping, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState("settings");

  // Settings state
  const [settings, setSettings] = useState({ youtube: "", instagram: "", tiktok: "", email: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // Portfolio state
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null or object
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialItem);
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState("");

  // Messages
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!bootstrapping && !user) navigate("/admin/login");
  }, [bootstrapping, user, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get("/settings").then(({ data }) => setSettings(data)).catch(() => {});
    api.get("/portfolio").then(({ data }) => setItems(data)).catch(() => {});
    api.get("/contacts").then(({ data }) => setMessages(data)).catch(() => {});
  }, [user]);

  const onLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSettingsMsg("");
    setSettingsSaving(true);
    try {
      await api.put("/settings", settings);
      setSettingsMsg(t("admin.saved"));
      setTimeout(() => setSettingsMsg(""), 2500);
    } catch (err) {
      setSettingsMsg(formatApiError(err.response?.data?.detail) || "Error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const openCreate = () => {
    setForm(initialItem);
    setEditing(null);
    setShowCreate(true);
    setItemError("");
  };

  const openEdit = (item) => {
    setForm({
      ...initialItem,
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    });
    setEditing(item);
    setShowCreate(true);
    setItemError("");
  };

  const saveItem = async (e) => {
    e.preventDefault();
    setItemError("");
    setSavingItem(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        tags: typeof form.tags === "string"
          ? form.tags.split(",").map((s) => s.trim()).filter(Boolean)
          : form.tags,
      };
      if (editing) {
        const { data } = await api.put(`/portfolio/${editing.id}`, payload);
        setItems((arr) => arr.map((i) => (i.id === data.id ? data : i)));
      } else {
        const { data } = await api.post("/portfolio", payload);
        setItems((arr) => [...arr, data]);
      }
      setShowCreate(false);
      setEditing(null);
    } catch (err) {
      setItemError(formatApiError(err.response?.data?.detail) || "Error");
    } finally {
      setSavingItem(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm(t("admin.confirm_delete"))) return;
    try {
      await api.delete(`/portfolio/${id}`);
      setItems((arr) => arr.filter((i) => i.id !== id));
    } catch (_) {}
  };

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white/40 flex items-center justify-center vx-overline">
        Loading...
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Topbar */}
      <header className="border-b border-white/10">
        <div className="vx-container py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center" data-testid="admin-logo" aria-label="Veltrax">
              <img
                src="/brand/veltrax-logo.png"
                alt="Veltrax"
                className="h-12 w-12"
                style={{ objectFit: "contain" }}
              />
            </Link>
            <span className="vx-overline text-white/40 hidden sm:inline">/ {t("admin.dashboard")}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              data-testid="admin-view-site"
              className="vx-link hidden sm:inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-display tracking-widest uppercase"
            >
              View site <ArrowUpRight size={12} />
            </Link>
            <button
              onClick={onLogout}
              data-testid="admin-logout"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-display tracking-widest uppercase"
            >
              <LogOut size={14} /> {t("admin.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-white/10 p-8 flex-col gap-3">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              data-testid={`admin-tab-${id}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-display tracking-widest uppercase border-l-2 transition-all ${
                tab === id
                  ? "border-white text-white bg-white/5"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden flex border-b border-white/10 w-full overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              data-testid={`admin-mtab-${id}`}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4 text-xs font-display tracking-widest uppercase ${
                tab === id ? "text-white border-b-2 border-white" : "text-white/40"
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 sm:p-10 lg:p-16">
          {tab === "settings" && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <span className="vx-overline">— {t("admin.social_links")}</span>
              <h2 className="mt-4 font-display text-white text-3xl sm:text-4xl font-light tracking-tight uppercase mb-12">
                {t("admin.social_links")}
              </h2>

              <form onSubmit={saveSettings} className="space-y-8" data-testid="admin-settings-form">
                {[
                  { k: "email", label: t("admin.contact_email"), ph: "hello@velstrax.com" },
                  { k: "instagram", label: t("admin.instagram"), ph: "https://instagram.com/…" },
                  { k: "youtube", label: t("admin.youtube"), ph: "https://youtube.com/@…" },
                  { k: "tiktok", label: t("admin.tiktok"), ph: "https://tiktok.com/@…" },
                ].map(({ k, label, ph }) => (
                  <div key={k}>
                    <label className="vx-overline block mb-2">{label}</label>
                    <input
                      type={k === "email" ? "email" : "url"}
                      value={settings[k] || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value }))}
                      data-testid={`admin-settings-${k}`}
                      className="vx-input"
                      placeholder={ph}
                    />
                  </div>
                ))}

                <div className="flex items-center gap-6 pt-4">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    data-testid="admin-settings-save"
                    className="vx-btn-primary disabled:opacity-50"
                  >
                    {settingsSaving ? t("admin.saving") : t("admin.save")}
                    <ArrowUpRight size={16} />
                  </button>
                  {settingsMsg && (
                    <span data-testid="admin-settings-msg" className="vx-overline text-white/60">
                      {settingsMsg}
                    </span>
                  )}
                </div>
              </form>
            </motion.section>
          )}

          {tab === "portfolio" && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                <div>
                  <span className="vx-overline">— {t("admin.portfolio")}</span>
                  <h2 className="mt-3 font-display text-white text-3xl sm:text-4xl font-light tracking-tight uppercase">
                    {t("admin.portfolio")}
                  </h2>
                </div>
                <button
                  onClick={openCreate}
                  data-testid="admin-portfolio-add"
                  className="vx-btn-primary"
                >
                  <Plus size={14} /> {t("admin.add_item")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item) => (
                  <article
                    key={item.id}
                    data-testid={`admin-item-${item.id}`}
                    className="group border border-white/10 hover:border-white/30 transition-colors bg-[#121212]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover vx-grayscale"
                      />
                    </div>
                    <div className="p-5">
                      <span className="vx-overline text-white/40">{item.category}</span>
                      <h4 className="mt-2 font-display text-white text-xl font-light tracking-tight">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-white/50 text-sm font-light line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <button
                          onClick={() => openEdit(item)}
                          data-testid={`admin-edit-${item.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-white/20 text-white/80 hover:bg-white hover:text-black text-xs uppercase tracking-widest font-display transition-colors"
                        >
                          <Pencil size={12} /> {t("admin.edit")}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          data-testid={`admin-delete-${item.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-white/10 text-white/40 hover:text-white hover:border-white text-xs uppercase tracking-widest font-display transition-colors"
                        >
                          <Trash2 size={12} /> {t("admin.delete")}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>
          )}

          {tab === "messages" && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="vx-overline">— {t("admin.messages")}</span>
              <h2 className="mt-3 font-display text-white text-3xl sm:text-4xl font-light tracking-tight uppercase mb-10">
                {t("admin.messages")}
              </h2>

              {messages.length === 0 ? (
                <p className="text-white/40 vx-overline">No messages yet.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      data-testid={`admin-msg-${m.id}`}
                      className="border border-white/10 bg-[#121212] p-6"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="font-display text-white text-lg">{m.name}</p>
                          <a
                            href={`mailto:${m.email}`}
                            className="vx-link text-white/60 text-sm font-light"
                          >
                            {m.email}
                          </a>
                        </div>
                        <span className="vx-overline text-white/40">
                          {new Date(m.created_at).toLocaleString()}
                        </span>
                      </div>
                      {m.company && (
                        <p className="mt-3 text-white/50 text-sm">
                          <span className="vx-overline">Company:</span> {m.company}
                        </p>
                      )}
                      {m.budget && (
                        <p className="mt-1 text-white/50 text-sm">
                          <span className="vx-overline">Budget:</span> {m.budget}
                        </p>
                      )}
                      <p className="mt-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {m.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </main>
      </div>

      {/* Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          data-testid="admin-modal-overlay"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#0A0A0A] border border-white/10 w-full max-w-3xl max-h-[92vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-md flex items-center justify-between p-6 border-b border-white/10 z-10">
              <h3 className="font-display text-white text-xl tracking-tight uppercase">
                {editing ? t("admin.edit") : t("admin.add_item")}
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                data-testid="admin-modal-close"
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveItem} className="p-6 space-y-6" data-testid="admin-item-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="vx-overline block mb-2">{t("admin.title")}</label>
                  <input className="vx-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="item-title" />
                </div>
                <div>
                  <label className="vx-overline block mb-2">{t("admin.title_en")}</label>
                  <input className="vx-input" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} data-testid="item-title-en" />
                </div>
                <div>
                  <label className="vx-overline block mb-2">{t("admin.category")}</label>
                  <input className="vx-input" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="item-category" />
                </div>
                <div>
                  <label className="vx-overline block mb-2">{t("admin.category_en")}</label>
                  <input className="vx-input" value={form.category_en} onChange={(e) => setForm({ ...form, category_en: e.target.value })} data-testid="item-category-en" />
                </div>
              </div>

              <div>
                <label className="vx-overline block mb-2">{t("admin.description")}</label>
                <textarea rows={3} required className="vx-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="item-description" />
              </div>
              <div>
                <label className="vx-overline block mb-2">{t("admin.description_en")}</label>
                <textarea rows={3} className="vx-input" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} data-testid="item-description-en" />
              </div>

              <div>
                <label className="vx-overline block mb-2">{t("admin.image_url")}</label>
                <input type="url" className="vx-input" required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} data-testid="item-image-url" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="vx-overline block mb-2">{t("admin.metric_before")}</label>
                  <input className="vx-input" value={form.metric_before} onChange={(e) => setForm({ ...form, metric_before: e.target.value })} data-testid="item-metric-before" />
                </div>
                <div>
                  <label className="vx-overline block mb-2">{t("admin.metric_after")}</label>
                  <input className="vx-input" value={form.metric_after} onChange={(e) => setForm({ ...form, metric_after: e.target.value })} data-testid="item-metric-after" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="vx-overline block mb-2">{t("admin.tags")}</label>
                  <input className="vx-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} data-testid="item-tags" />
                </div>
                <div>
                  <label className="vx-overline block mb-2">{t("admin.order")}</label>
                  <input type="number" className="vx-input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} data-testid="item-order" />
                </div>
              </div>

              {itemError && <p className="text-red-300/80 text-sm">{itemError}</p>}

              <div className="flex items-center gap-4 pt-2">
                <button type="submit" disabled={savingItem} className="vx-btn-primary disabled:opacity-50" data-testid="item-save">
                  {savingItem ? t("admin.saving") : editing ? t("admin.save") : t("admin.create")}
                  <ArrowUpRight size={16} />
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="vx-btn-ghost" data-testid="item-cancel">
                  {t("admin.cancel")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
