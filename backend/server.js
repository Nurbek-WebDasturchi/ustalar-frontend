const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "ustalar_secret_dev";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token yo'q" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token noto'g'ri" });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin huquqi yo'q" });
    next();
  });
}

// Register
app.post("/api/register", async (req, res) => {
  const { fullname, phone, password } = req.body;
  if (!fullname || !phone || !password)
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("phone", phone)
    .single();
  if (existing)
    return res
      .status(400)
      .json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });

  const hashed = await bcrypt.hash(password, 10);
  const { data: user, error } = await supabase
    .from("users")
    .insert({ fullname, phone, password: hashed, role: "user" })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  const token = jwt.sign(
    { id: user.id, role: user.role, fullname },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({ token, user: { id: user.id, fullname, phone, role: "user" } });
});

// Login
app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });

  const token = jwt.sign(
    { id: user.id, role: user.role, fullname: user.fullname },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({
    token,
    user: {
      id: user.id,
      fullname: user.fullname,
      phone: user.phone,
      role: user.role,
    },
  });
});

// Me
app.get("/api/me", authMiddleware, async (req, res) => {
  const { data: user } = await supabase
    .from("users")
    .select("id,fullname,phone,role,created_at")
    .eq("id", req.user.id)
    .single();
  if (!user) return res.status(404).json({ error: "Topilmadi" });
  res.json(user);
});

// E'lon berish
app.post("/api/ustalar/apply", authMiddleware, async (req, res) => {
  const { fullname, phone, city, job, avatar } = req.body;
  if (!fullname || !phone || !city || !job)
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });

  const { data, error } = await supabase
    .from("ustalar")
    .insert({
      fullname,
      phone,
      city,
      job,
      avatar: avatar || null,
      user_id: req.user.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "E'loningiz admin tasdiqiga yuborildi", id: data.id });
});

// Tasdiqlangan ustalar
app.get("/api/ustalar", async (req, res) => {
  const { data, error } = await supabase
    .from("ustalar")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin: statistika
app.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  const [u, a, p] = await Promise.all([
    supabase
      .from("users")
      .select("id", { count: "exact" })
      .neq("role", "admin"),
    supabase
      .from("ustalar")
      .select("id", { count: "exact" })
      .eq("status", "approved"),
    supabase
      .from("ustalar")
      .select("id", { count: "exact" })
      .eq("status", "pending"),
  ]);
  res.json({
    totalUsers: u.count || 0,
    totalUstalar: a.count || 0,
    pendingCount: p.count || 0,
  });
});

// Admin: kutayotganlar
app.get("/api/admin/pending", adminMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("ustalar")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin: tasdiqlash
app.post("/api/admin/approve/:id", adminMiddleware, async (req, res) => {
  const { error } = await supabase
    .from("ustalar")
    .update({ status: "approved" })
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Tasdiqlandi" });
});

// Admin: rad etish
app.post("/api/admin/reject/:id", adminMiddleware, async (req, res) => {
  const { error } = await supabase
    .from("ustalar")
    .delete()
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Rad etildi" });
});

// Admin: ustani o'chirish
app.delete("/api/admin/ustalar/:id", adminMiddleware, async (req, res) => {
  const { error } = await supabase
    .from("ustalar")
    .delete()
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "O'chirildi" });
});

// Admin: foydalanuvchilar
app.get("/api/admin/users", adminMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,fullname,phone,role,created_at")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin: foydalanuvchini o'chirish
app.delete("/api/admin/users/:id", adminMiddleware, async (req, res) => {
  const { data: t } = await supabase
    .from("users")
    .select("role")
    .eq("id", req.params.id)
    .single();
  if (t?.role === "admin")
    return res.status(403).json({ error: "Adminni o'chirib bo'lmaydi" });
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "O'chirildi" });
});

app.get("/", (req, res) =>
  res.json({ status: "ok", message: "Ustalar API ishlayapti ✅" }),
);

app.listen(PORT, () => console.log(`✅ Server http://localhost:${PORT}`));
