// 방명록: Supabase REST API를 직접 호출한다 (공개용 publishable 키, 쓰기 권한은 DB 규칙이 제한).
const API = `${window.SUPABASE_URL}/rest/v1/guestbook`;
const HEADERS = { apikey: window.SUPABASE_KEY, "Content-Type": "application/json" };

const form = document.getElementById("gb-form");
const list = document.getElementById("gb-list");
const statusEl = document.getElementById("gb-status");

function render(rows) {
  list.replaceChildren(...rows.map((r) => {
    const li = document.createElement("li");
    const meta = document.createElement("div");
    meta.className = "meta";
    const name = document.createElement("b");
    name.textContent = r.name;
    meta.append(name, new Date(r.created_at).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }));
    const msg = document.createElement("div");
    msg.className = "msg";
    msg.textContent = r.message;
    li.append(meta, msg);
    return li;
  }));
  if (!rows.length) list.innerHTML = '<li class="meta">아직 글이 없어요. 첫 글을 남겨주세요!</li>';
}

async function load() {
  const res = await fetch(`${API}?select=name,message,created_at&order=created_at.desc&limit=50`, { headers: HEADERS });
  if (!res.ok) throw new Error("불러오기 실패");
  render(await res.json());
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (document.getElementById("gb-website").value) return; // 봇
  const name = document.getElementById("gb-name").value.trim();
  const message = document.getElementById("gb-message").value.trim();
  if (!name || !message) return;
  const button = form.querySelector("button");
  button.disabled = true;
  statusEl.textContent = "저장 중…";
  try {
    const res = await fetch(API, { method: "POST", headers: HEADERS, body: JSON.stringify({ name, message }) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.code === "P0001" ? err.message : "저장하지 못했어요");
    }
    form.reset();
    statusEl.textContent = "고마워요!";
    await load();
  } catch (err) {
    statusEl.textContent = err.message;
  } finally {
    button.disabled = false;
  }
});

load().catch(() => { statusEl.textContent = "방명록을 불러오지 못했어요"; });
