CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price REAL,
  type TEXT,
  location TEXT,
  m2_lote REAL,
  m2_construccion REAL,
  bathrooms REAL,
  parking INTEGER,
  bedrooms INTEGER,
  floors INTEGER,
  level INTEGER,
  description TEXT,
  coordinates TEXT, -- Stored as JSON string {"lat": ..., "lng": ...}
  images TEXT,      -- Stored as JSON array string ["url1", "url2", ...]
  uploadedAt TEXT
);
