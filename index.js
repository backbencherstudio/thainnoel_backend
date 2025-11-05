import createApp from "./lib/library.js";
import db_connect from "./db/db.config.js";
import Message from "./models/Message.js";
import {
  consultationEmailToUser,
  consultationEmailToAdmin,
} from "./util/email.service.js";

const app = createApp();

app.use(app.json());
app.use(app.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  try {
    const { firstName, lastName, company, email, service, datetime } = req.body;

    const missingField = [
      "firstName",
      "lastName",
      "email",
      "service",
      "datetime",
    ].find((field) => !req.body[field]);
    if (missingField) {
      return res.status(400).send({
        success: false,
        message: `${missingField} is required!`,
      });
    }

    consultationEmailToUser(
      firstName,
      lastName,
      company,
      email,
      service,
      datetime
    );
    consultationEmailToAdmin(
      firstName,
      lastName,
      company,
      email,
      service,
      datetime
    );

    res.status(200).json({
      success: true,
      data: firstName,
      lastName,
      company,
      email,
      service,
      datetime,
    });
  } catch (error) {
    res.status(500).json({
      successs: false,
      message: "internal server error",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/message", async (req, res) => {
  try {
    const { fullName, email, message } = req.body;
    const missing = ["fullName", "email", "message"].filter(
      (x) => !req.body?.[x]
    );
    if (missing.length) {
      return res
        .status(400)
        .json({ success: false, message: `${missing.join(", ")} required` });
    }

    const newMsg = await Message.create({ fullName, email, message });
    return res.status(201).json({
      success: true,
      message: "Message saved",
      data: {
        id: newMsg._id,
        fullName: newMsg.fullName,
        email: newMsg.email,
        createdAt: newMsg.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to save" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();

    const rows = messages
      .map((m) => {
        const initials = (m.fullName || "?")
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() || "?")
          .join("");
        return `
      <article class="card">
        <div class="card-header">
          <div class="avatar" aria-hidden="true">${initials}</div>
          <div class="meta">
            <div class="name">${m.fullName}</div>
            <a class="email" href="mailto:${m.email}">${m.email}</a>
          </div>
          <div class="time">${new Date(m.createdAt).toLocaleString()}</div>
        </div>
        <div class="card-body">${(m.message || "")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</div>
      </article>`;
      })
      .join("");

    const page = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Messages</title><style>
:root{--bg:#0b1220;--panel:#0f172a;--muted:#94a3b8;--text:#e2e8f0;--primary:#4f46e5;--ring:rgba(79,70,229,.2)}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:radial-gradient(1200px 600px at 10% -10%,rgba(79,70,229,.12),transparent 60%),radial-gradient(1000px 500px at 110% 10%,rgba(16,185,129,.08),transparent 60%),var(--bg);color:var(--text);font:14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}
.shell{max-width:960px;margin-inline:auto;padding:32px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.brand .logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--primary),#22c55e);box-shadow:0 10px 30px rgba(79,70,229,.35);}
.brand h1{font-size:20px;margin:0;font-weight:700;letter-spacing:.2px}
.panel{background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.01));border:1px solid rgba(148,163,184,.15);border-radius:16px;box-shadow:0 10px 30px rgba(2,6,23,.4), inset 0 1px 0 rgba(255,255,255,.05)}
.panel .head{display:flex;align-items:center;justify-content:space-between;padding:18px 18px;border-bottom:1px solid rgba(148,163,184,.12)}
.panel .head .title{font-weight:600;letter-spacing:.2px}
.panel .head .count{color:var(--muted);font-size:12px}
.grid{display:grid;grid-template-columns:1fr;gap:14px;padding:18px}
@media(min-width:720px){.grid{grid-template-columns:1fr 1fr}}
.card{background:rgba(15,23,42,.65);border:1px solid rgba(148,163,184,.14);border-radius:14px;padding:16px;box-shadow:0 6px 16px rgba(2,6,23,.45);backdrop-filter: blur(6px)}
.card:hover{border-color:rgba(79,70,229,.4);box-shadow:0 8px 20px rgba(79,70,229,.18)}
.card-header{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#1f2937,#111827);color:#cbd5e1;font-weight:700;border:1px solid rgba(148,163,184,.18)}
.meta{display:flex;flex-direction:column;gap:2px}
.name{font-weight:600}
.email{color:var(--muted);text-decoration:none}
.email:hover{color:#cbd5e1;text-decoration:underline}
.time{margin-left:auto;color:var(--muted);font-size:12px}
.card-body{white-space:pre-wrap;color:#dbeafe;background:rgba(30,41,59,.55);border:1px solid rgba(148,163,184,.12);padding:12px;border-radius:10px}
.empty{padding:28px;text-align:center;color:var(--muted)}
</style></head><body>
  <div class="shell">
    <div class="brand"><div class="logo"></div><h1>Messages</h1></div>
    <section class="panel">
      <div class="head"><div class="title">Inbox</div><div class="count">${
        messages.length
      } message${messages.length === 1 ? "" : "s"}</div></div>
      <div class="grid">
        ${rows || "<div class='empty'>No messages yet.</div>"}
      </div>
    </section>
  </div>
</body></html>`;

    res.send(page);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: "Failed to load messages" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  db_connect();
});
