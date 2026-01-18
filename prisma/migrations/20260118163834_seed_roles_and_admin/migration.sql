-- Insert Roles
INSERT INTO "Role" (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO "Role" (name) VALUES ('teacher') ON CONFLICT (name) DO NOTHING;
INSERT INTO "Role" (name) VALUES ('parent') ON CONFLICT (name) DO NOTHING;
