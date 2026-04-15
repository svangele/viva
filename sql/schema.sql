CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price REAL,
  type TEXT,
  status TEXT DEFAULT 'Disponible',
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
  water_storage TEXT,
  gas_storage TEXT,
  is_private TEXT,
  maintenance_fee TEXT,
  service_gas TEXT,
  service_light TEXT,
  service_water TEXT,
  service_internet TEXT,
  uploadedAt TEXT
);
