import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Campaign } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CampaignContextType {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  activeCampaignId: number | null;
  setActiveCampaignId: (id: number) => void;
  refreshCampaigns: () => Promise<void>;
  loading: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('zcm_active_campaign_id');
    return saved ? parseInt(saved, 10) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.getCampaigns();
      const list: Campaign[] = Array.isArray(res) ? res : res.results || [];
      setCampaigns(list);

      // Select active campaign
      if (list.length > 0) {
        if (activeCampaignId && list.some((c) => c.id === activeCampaignId)) {
          // already valid
        } else {
          // default to active campaign or most recent
          const active = list.find((c) => c.status === 'active') || list[0];
          setActiveCampaignIdState(active.id);
          localStorage.setItem('zcm_active_campaign_id', String(active.id));
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeCampaignId]);

  useEffect(() => {
    refreshCampaigns();
  }, [refreshCampaigns]);

  const setActiveCampaignId = (id: number) => {
    setActiveCampaignIdState(id);
    localStorage.setItem('zcm_active_campaign_id', String(id));
  };

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0] || null;

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        activeCampaign,
        activeCampaignId,
        setActiveCampaignId,
        refreshCampaigns,
        loading,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export function useCampaign(): CampaignContextType {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
