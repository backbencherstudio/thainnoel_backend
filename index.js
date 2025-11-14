import createApp from "./lib/library.js";
import db_connect from "./db/db.config.js";
import Message from "./models/Message.js";
import mongoose from "mongoose";
import {
  consultationEmailToUser,
  consultationEmailToAdmin,
} from "./util/email.service.js";

const app = createApp();
// ---------- CORS middleware (no policy, fully open) ----------
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );


  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.cors = () => (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
};


app.use(app.json());
app.use(app.urlencoded({ extended: true }));

app.post("/email", async (req, res) => {
  try {
    const { firstName, lastName, company, email, service, datetime, message, timezone } = req.body;

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
      datetime,
      message || "",
      timezone || ""
    );

    res.status(200).json({
      success: true,
      data: {
        firstName,
        lastName,
        company,
        email,
        service,
        datetime,
        message: message || "",
        timezone: timezone || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
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
        const messageId = m._id.toString();
        return `
      <article class="card" data-id="${messageId}">
        <div class="card-header">
          <div class="avatar" aria-hidden="true">${initials}</div>
          <div class="meta">
            <div class="name">${m.fullName}</div>
            <a class="email" href="mailto:${m.email}">${m.email}</a>
          </div>
          <div class="header-right">
            <div class="time">${new Date(m.createdAt).toLocaleString()}</div>
            <button class="delete-btn" onclick="deleteMessage('${messageId}')" aria-label="Delete message" title="Delete message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="card-body">${(m.message || "")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>")}</div>
      </article>`;
      })
      .join("");

    const page = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Messages</title><style>
:root{--bg:#0b1220;--panel:#0f172a;--muted:#94a3b8;--text:#e2e8f0;--primary:#4f46e5;--ring:rgba(79,70,229,.2);--danger:#ef4444}
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
.grid{display:grid;grid-template-columns:1fr;gap:14px;padding:18px;align-items:start}
@media(min-width:720px){.grid{grid-template-columns:1fr 1fr}}
.card{background:rgba(15,23,42,.65);border:1px solid rgba(148,163,184,.14);border-radius:14px;padding:16px;box-shadow:0 6px 16px rgba(2,6,23,.45);backdrop-filter: blur(6px);display:flex;flex-direction:column;height:100%}
.card:hover{border-color:rgba(79,70,229,.4);box-shadow:0 8px 20px rgba(79,70,229,.18)}
.card-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;flex-shrink:0}
.avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#1f2937,#111827);color:#cbd5e1;font-weight:700;border:1px solid rgba(148,163,184,.18);flex-shrink:0}
.meta{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.name{font-weight:600;word-break:break-word}
.email{color:var(--muted);text-decoration:none;word-break:break-all;font-size:13px}
.email:hover{color:#cbd5e1;text-decoration:underline}
.header-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;margin-left:auto}
.time{color:var(--muted);font-size:12px;white-space:nowrap}
.delete-btn{background:linear-gradient(135deg,rgba(79,70,229,.15),rgba(79,70,229,.1));border:1px solid rgba(79,70,229,.3);color:var(--primary);width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);opacity:0.8;flex-shrink:0;position:relative;box-shadow:0 2px 4px rgba(79,70,229,.1)}
.delete-btn::before{content:'';position:absolute;inset:0;border-radius:8px;background:linear-gradient(135deg,var(--primary),#6366f1);opacity:0;transition:opacity 0.3s}
.delete-btn:hover{background:linear-gradient(135deg,rgba(79,70,229,.25),rgba(79,70,229,.2));border-color:var(--primary);opacity:1;transform:scale(1.1) translateY(-1px);box-shadow:0 4px 12px rgba(79,70,229,.3)}
.delete-btn:hover::before{opacity:0.1}
.delete-btn:active{transform:scale(1.05) translateY(0);box-shadow:0 2px 6px rgba(79,70,229,.2)}
.delete-btn svg{width:16px;height:16px;position:relative;z-index:1;stroke-width:2.5}
.card-body{white-space:pre-wrap;color:#dbeafe;background:rgba(30,41,59,.55);border:1px solid rgba(148,163,184,.12);padding:12px;border-radius:10px;flex:1;word-break:break-word;overflow-wrap:break-word}
.empty{padding:28px;text-align:center;color:var(--muted);grid-column:1/-1}
.card.deleting{opacity:0.5;pointer-events:none;transform:scale(0.98);transition:all 0.3s}
</style>
<script>
async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  const card = document.querySelector(\`[data-id="\${id}"]\`);
  const btn = card?.querySelector('.delete-btn');
  if (!card || !id) return;
  
  if (btn) {
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.5';
  }
  card.classList.add('deleting');
  
  try {
    const res = await fetch(\`/messages/\${id}\`, { 
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Check if response is OK and has JSON content
    if (!res.ok) {
      const errorText = await res.text();
      let errorMsg = 'Failed to delete message';
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    
    // Parse JSON response
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format');
    }
    
    const data = await res.json();
    
    if (data.success) {
      card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9) translateY(-10px)';
      setTimeout(() => {
        card.remove();
        updateMessageCount();
      }, 400);
    } else {
      throw new Error(data.message || 'Failed to delete message');
    }
  } catch (e) {
    console.error('Delete error:', e);
    alert('Error: ' + (e.message || 'Failed to delete message. Please try again.'));
    card.classList.remove('deleting');
    if (btn) {
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
    }
  }
}
function updateMessageCount() {
  const cards = document.querySelectorAll('.card:not(.deleting)');
  const countEl = document.querySelector('.count');
  if (countEl) {
    const count = cards.length;
    countEl.textContent = \`\${count} message\${count === 1 ? '' : 's'}\`;
  }
}
</script>
</head><body>
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


app.use((req, res, next) => {
  if (req.method === "DELETE" && req.url.startsWith("/messages/") && req.url !== "/messages") {
    const urlParts = req.url.split("/");
    if (urlParts.length === 3 && urlParts[1] === "messages" && urlParts[2]) {
      const id = urlParts[2];
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid message ID" });
      }

      Message.deleteOne({ _id: new mongoose.Types.ObjectId(id) })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Message not found" });
          }
          return res.json({ success: true, message: "Message deleted successfully" });
        })
        .catch((e) => {
          console.error("Delete error:", e);
          return res.status(500).json({ success: false, message: "Failed to delete message", error: e.message });
        });
      return;
    }
  }
  
  next();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  db_connect();
});
