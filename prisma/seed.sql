-- Seed de dados mínimos para operar as 4 abas
-- Execute no Supabase SQL editor

WITH c AS (
  INSERT INTO clients (id, name, cpf_cnpj, phone, email, created_by, created_at, updated_at)
  VALUES ('cl_demo_1', 'Cliente Demo', '00000000000', '0000000000', 'demo@example.com', 'seed', now(), now())
  ON CONFLICT (cpf_cnpj) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
prod AS (
  INSERT INTO products (id, name, type, active_ingredient, created_by, created_at, updated_at)
  VALUES ('pr_demo_1', 'Produto Demo 1', 'FERTILIZANTE', 'NPK', 'seed', now(), now())
  ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type
  RETURNING id
),
prop AS (
  INSERT INTO properties (id, client_id, name, city, created_by, created_at, updated_at)
  VALUES ('pp_demo_1', (SELECT id FROM c), 'Propriedade Demo', 'Cidade Demo', 'seed', now(), now())
  ON CONFLICT DO NOTHING
  RETURNING id
),
plot AS (
  INSERT INTO plots (id, property_id, name, crop, area_hectares, created_by, created_at, updated_at)
  VALUES ('pl_demo_1', COALESCE((SELECT id FROM prop), (SELECT id FROM properties WHERE name='Propriedade Demo' AND client_id=(SELECT id FROM c) LIMIT 1)), 'Talhão 1', 'Milho', 10, 'seed', now(), now())
  ON CONFLICT DO NOTHING
  RETURNING id
),
visit AS (
  INSERT INTO visits (id, client_id, property_id, scheduled_date, status, objective, created_by, created_at, updated_at)
  VALUES ('vs_demo_1', (SELECT id FROM c), COALESCE((SELECT id FROM prop), (SELECT id FROM properties WHERE name='Propriedade Demo' AND client_id=(SELECT id FROM c) LIMIT 1)), now() + interval '1 day', 'AGENDADA', 'Visita de demonstração', 'seed', now(), now())
  ON CONFLICT DO NOTHING
  RETURNING id
)
INSERT INTO sales_orders (id, client_id, visit_id, status, created_by, created_at, updated_at)
VALUES ('so_demo_1', (SELECT id FROM c), COALESCE((SELECT id FROM visit), (SELECT id FROM visits WHERE client_id=(SELECT id FROM c) LIMIT 1)), 'COTAÇÃO', 'seed', now(), now())
ON CONFLICT DO NOTHING;

-- Item do pedido
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
VALUES ('oi_demo_1', 'so_demo_1', (SELECT id FROM prod), 1, 100)
ON CONFLICT DO NOTHING;
