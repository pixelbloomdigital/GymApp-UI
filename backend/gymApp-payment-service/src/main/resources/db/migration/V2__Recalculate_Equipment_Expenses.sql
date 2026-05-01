-- Recalculate equipment expense amounts to be amount * quantity
-- This migration fixes any existing expenses that were stored with only unit amount

UPDATE expenses e
INNER JOIN equipment eq ON e.equipment_id = eq.id
SET e.amount = eq.amount * eq.quantity
WHERE e.topic = 'EQUIPMENT'
  AND e.equipment_id IS NOT NULL
  AND e.amount != (eq.amount * eq.quantity);
