import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { UserHuddle, UserHuddleDashboard, UserHuddleStats, UserRole } from '../types';

export function useUserHuddles(userId: number | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserHuddlesByRole = async (role: UserRole): Promise<UserHuddle[]> => {
    if (!userId) throw new Error('User ID is required');
    
    setLoading(true);
    setError(null);
    
    try {
      const huddles = await apiClient.getUserHuddlesByRole(userId, role);
      return huddles;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user huddles';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUserHuddles = async (): Promise<UserHuddle[]> => {
    if (!userId) throw new Error('User ID is required');
    
    setLoading(true);
    setError(null);
    
    try {
      const huddles = await apiClient.getAllUserHuddles(userId);
      return huddles;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch all user huddles';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHuddleDetails = async (sequenceId: number, role: UserRole): Promise<UserHuddle> => {
    if (!userId) throw new Error('User ID is required');
    
    setLoading(true);
    setError(null);
    
    try {
      const huddle = await apiClient.getUserHuddleDetails(userId, sequenceId, role);
      return huddle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch huddle details';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRolesWithHuddles = async (): Promise<UserRole[]> => {
    if (!userId) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const roles = await apiClient.getUserRolesWithHuddles(userId);
      return roles;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user roles';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleHuddleStats = async (role: UserRole): Promise<UserHuddleStats> => {
    if (!userId) throw new Error('User ID is required');
    
    setLoading(true);
    setError(null);
    
    try {
      const stats = await apiClient.getRoleHuddleStats(userId, role);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch role stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleDashboardData = async (role: UserRole): Promise<UserHuddleDashboard> => {
    if (!userId) throw new Error('User ID is required');
    
    setLoading(true);
    setError(null);
    
    try {
      const dashboard = await apiClient.getRoleDashboardData(userId, role);
      return dashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchUserHuddlesByRole,
    fetchAllUserHuddles,
    fetchUserHuddleDetails,
    fetchUserRolesWithHuddles,
    fetchRoleHuddleStats,
    fetchRoleDashboardData,
    clearError: () => setError(null)
  };
}

export function useUserHuddlesByRole(userId: number | undefined, role: UserRole | undefined) {
  const [huddles, setHuddles] = useState<UserHuddle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId && role) {
      fetchHuddles();
    }
  }, [userId, role]);

  const fetchHuddles = async () => {
    if (!userId || !role) return;

    setLoading(true);
    setError(null);

    try {
      const huddleData = await apiClient.getUserHuddlesByRole(userId, role);
      setHuddles(huddleData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch huddles';
      setError(errorMessage);
      setHuddles([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    huddles,
    loading,
    error,
    refetch: fetchHuddles,
    clearError: () => setError(null)
  };
}

export function useUserRolesWithHuddles(userId: number | undefined) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchRoles();
    }
  }, [userId]);

  const fetchRoles = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const roleData = await apiClient.getUserRolesWithHuddles(userId);
      setRoles(roleData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
      setError(errorMessage);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
    clearError: () => setError(null)
  };
}