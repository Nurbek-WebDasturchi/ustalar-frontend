const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "ustalar_secret_key_2026";
const DB_FILE = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json({ limit: "5mb" }));

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const init = {
      users: [
        {
          id: 1,
          fullname: "Admin",
          email: "admin@ustalar.uz",
          password: bcrypt.hashSync("admin123", 10),
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      ],
      ustalar: [],
      pendingUstalar: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token yo'q" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token yaroqsiz" });
  }
}
function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin emas" });
    next();
  });
}

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password)
      return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
    const db = readDB();
    if (db.users.find((u) => u.email === email))
      return res
        .status(400)
        .json({ error: "Bu email allaqachon ro'yxatdan o'tgan" });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      fullname,
      email,
      password: hashed,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDB(db);
    const token = jwt.sign(
      { id: newUser.id, email, role: "user", fullname },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      token,
      user: { id: newUser.id, fullname, email, role: "user" },
    });
  } catch {
    res.status(500).json({ error: "Server xatosi" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find((u) => u.email === email);
    if (!user)
      return res.status(400).json({ error: "Email yoki parol noto'g'ri" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Email yoki parol noto'g'ri" });
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({ error: "Server xatosi" });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) =>
  res.json({ user: req.user }),
);

// Submit usta
app.post("/api/ustalar/submit", authMiddleware, (req, res) => {
  const db = readDB();
  const pending = {
    id: Date.now(),
    userId: req.user.id,
    userEmail: req.user.email,
    ...req.body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.pendingUstalar.push(pending);
  writeDB(db);
  res.json({
    message: "E'loningiz admin tomonidan ko'rib chiqiladi",
    id: pending.id,
  });
});

app.get("/api/ustalar", (req, res) => {
  const db = readDB();
  res.json(db.ustalar);
});

// Admin routes
app.get("/api/admin/users", adminMiddleware, (req, res) => {
  const db = readDB();
  res.json(db.users.map(({ password, ...u }) => u));
});
app.delete("/api/admin/users/:id", adminMiddleware, (req, res) => {
  const db = readDB();
  db.users = db.users.filter((u) => u.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ message: "O'chirildi" });
});
app.get("/api/admin/pending", adminMiddleware, (req, res) => {
  const db = readDB();
  res.json(db.pendingUstalar);
});
app.post("/api/admin/pending/:id/approve", adminMiddleware, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const found = db.pendingUstalar.find((u) => u.id === id);
  if (!found) return res.status(404).json({ error: "Topilmadi" });
  found.status = "approved";
  found.approvedAt = new Date().toISOString();
  db.ustalar.push({ ...found });
  db.pendingUstalar = db.pendingUstalar.filter((u) => u.id !== id);
  writeDB(db);
  res.json({ message: "Tasdiqlandi" });
});
app.delete("/api/admin/pending/:id/reject", adminMiddleware, (req, res) => {
  const db = readDB();
  db.pendingUstalar = db.pendingUstalar.filter(
    (u) => u.id !== parseInt(req.params.id),
  );
  writeDB(db);
  res.json({ message: "Rad etildi" });
});
app.delete("/api/admin/ustalar/:id", adminMiddleware, (req, res) => {
  const db = readDB();
  db.ustalar = db.ustalar.filter((u) => u.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ message: "O'chirildi" });
});
app.get("/api/admin/stats", adminMiddleware, (req, res) => {
  const db = readDB();
  res.json({
    totalUsers: db.users.length,
    totalUstalar: db.ustalar.length,
    pendingCount: db.pendingUstalar.length,
    adminCount: db.users.filter((u) => u.role === "admin").length,
  });
});

app.listen(PORT, () => console.log("Server: http://localhost:" + PORT));
