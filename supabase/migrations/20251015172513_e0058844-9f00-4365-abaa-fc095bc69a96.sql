-- Adicionar colunas faltantes na tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Adicionar colunas faltantes na tabela pets
ALTER TABLE public.pets 
ADD COLUMN IF NOT EXISTS sex TEXT,
ADD COLUMN IF NOT EXISTS size TEXT;