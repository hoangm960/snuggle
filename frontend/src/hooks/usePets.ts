import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Pet } from '@/types';

interface UsePetsReturn {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  getPetById: (id: string) => Promise<Pet | null>;
  createPet: (pet: Omit<Pet, 'id'>) => Promise<Pet | null>;
  updatePet: (id: string, pet: Partial<Pet>) => Promise<Pet | null>;
  deletePet: (id: string) => Promise<boolean>;
}

export const usePets = (): UsePetsReturn => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/pets');
      setPets(response.data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  const getPetById = async (id: string): Promise<Pet | null> => {
    try {
      const response = await api.get(`/pets/${id}`);
      return response.data.data;
    } catch {
      return null;
    }
  };

  const createPet = async (pet: Omit<Pet, 'id'>): Promise<Pet | null> => {
    try {
      const response = await api.post('/pets', pet);
      setPets((prev) => [...prev, response.data.data]);
      return response.data.data;
    } catch {
      return null;
    }
  };

  const updatePet = async (id: string, pet: Partial<Pet>): Promise<Pet | null> => {
    try {
      const response = await api.put(`/pets/${id}`, pet);
      setPets((prev) => prev.map((p) => (p.id === id ? response.data.data : p)));
      return response.data.data;
    } catch {
      return null;
    }
  };

  const deletePet = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/pets/${id}`);
      setPets((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return { pets, loading, error, fetchPets, getPetById, createPet, updatePet, deletePet };
};