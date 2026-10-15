import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Banknote,
  Smartphone,
  Bus,
  Utensils,
  Percent,
  CheckCircle,
  AlertTriangle,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { formatINR, formatIndianDate, formatTime } from '../../utils/formatters';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Trip } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const navigate = useNavigate();

  // Query campaign summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['campaign-summary', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getCampaignSummary(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  // Query active trips
  const { data: activeTripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['active-trips', activeCampaignId],
    queryFn: () =>
      activeCampaignId ? api.getTrips({ campaign: activeCampaignId, status: 'in_progress' }) : null,
    enabled: !!activeCampaignId,
  });

  const fin = summaryData?.financial;
  const inv = summaryData?.inventory;
  const activeTrips: Trip[] = Array.isArray(activeTripsData)
    ? activeTripsData
    : activeTripsData?.results || [];

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Executive Operations Dashboard</h1>
          <div className="zcm-page-header__sub">
            Real-time financial status & distribution control for {activeCampaign?.name || 'Active Campaign'}
          </div>
        </div>

        <div className="zcm-page-header__actions">
          <button
            className="zcm-btn zcm-btn--primary"
            onClick={() => navigate('/trips')}
          >
            <Compass size={16} />
            <span>Manage Trips</span>
          </button>
        </div>
      </div>

      {/* Break-Even Indicator Banner */}
      {fin && (
        <div className="zcm-breakeven-banner">
          <div className="zcm-breakeven-banner__header">
            <h4>Campaign Break-Even & Financial Recovery</h4>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {fin.break_even_percentage}% Recovered
            </span>
          </div>
          <div className="zcm-breakeven-banner__bar">
            <div
              className="zcm-breakeven-fill"
              style={{ width: `${Math.min(100, fin.break_even_percentage)}%` }}
            />
          </div>
          <div className="zcm-breakeven-banner__stats">
            <span>
              Target Recovery: <strong>{formatINR(fin.break_even_target, true)}</strong>
            </span>
            <span>
              Total Collections: <strong>{formatINR(fin.total_collections, true)}</strong>
            </span>
            <span>
              Current Net Profit: <strong>{formatINR(fin.net_profit, true)}</strong>
            </span>
            {fin.is_provisional && (
              <span style={{ color: '#FCD34D' }}>
                • Figures provisional until all trips settle
              </span>
            )}
          </div>
        </div>
      )}

      {/* Primary Financial Metric Cards */}
      <div className="zcm-stat-grid">
        <StatCard
          title="Total Collections"
          value={formatINR(fin?.total_collections || 0)}
          subtitle={`Cash: ${formatINR(fin?.cash_collections || 0)} | GPay: ${formatINR(fin?.gpay_collections || 0)}`}
          icon={TrendingUp}
          variant="success"
        />

        <StatCard
          title="Net Campaign Profit"
          value={formatINR(fin?.net_profit || 0)}
          subtitle={parseFloat(fin?.net_profit || '0') >= 0 ? 'Profitable operation' : 'Below break-even'}
          icon={Banknote}
          variant={parseFloat(fin?.net_profit || '0') >= 0 ? 'success' : 'danger'}
        />

        <StatCard
          title="Available Stock"
          value={`${inv?.available_stock || 0} / ${inv?.printed_quantity || 0}`}
          subtitle={`Sold: ${inv?.calendars_sold || 0} | In Field: ${inv?.calendars_in_field || 0}`}
          icon={Package}
          variant="default"
        />

        <StatCard
          title="Student Commission"
          value={formatINR(fin?.total_commission_earned || 0)}
          subtitle={`Paid: ${formatINR(fin?.total_commission_paid || 0)} | Pending: ${formatINR(fin?.outstanding_commission || 0)}`}
          icon={Percent}
          variant="warning"
        />
      </div>

      {/* Active Trips Alert / Panel */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} style={{ color: '#2563EB' }} />
            <h3>Active Field Trips ({activeTrips.length})</h3>
          </div>
          <button
            className="zcm-btn zcm-btn--secondary zcm-btn--sm"
            onClick={() => navigate('/trips')}
          >
            <span>All Trips</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {activeTrips.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
            <CheckCircle size={28} style={{ color: '#10B981', margin: '0 auto 0.4rem' }} />
            <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.875rem' }}>No Active Trips in the Field</div>
            <div style={{ fontSize: '0.78125rem', color: '#94A3B8' }}>All dispatched trips have returned and settled.</div>
          </div>
        ) : (
          <div className="zcm-table-container">
            <table className="zcm-table">
              <thead>
                <tr>
                  <th>Trip #</th>
                  <th>Destination</th>
                  <th>Students</th>
                  <th className="zcm-text-right">Issued</th>
                  <th>Departure</th>
                  <th>Receipt Book</th>
                  <th className="zcm-text-right">Fare Advance</th>
                  <th className="zcm-text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>#{trip.id}</span>
                    </td>
                    <td>
                      <strong>{trip.place_name}</strong>
                    </td>
                    <td>
                      {trip.trip_students.map((ts) => ts.student_name).join(', ')}
                    </td>
                    <td className="zcm-text-right zcm-num">
                      <Badge variant="neutral">{trip.calendars_issued} pcs</Badge>
                    </td>
                    <td>
                      {formatTime(trip.departure_time)}
                    </td>
                    <td>
                      {trip.receipt_book_label ? (
                        <span>{trip.receipt_book_label} (Leaf #{trip.receipt_starting_leaf})</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="zcm-text-right zcm-num">{formatINR(trip.bus_fare)}</td>
                    <td className="zcm-text-right">
                      <button
                        className="zcm-btn zcm-btn--success zcm-btn--sm"
                        onClick={() => navigate(`/trips?settle=${trip.id}`)}
                      >
                        Settle Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Secondary Financial & Inventory Ledger Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Expenses Breakdown */}
        <div className="zcm-card">
          <div className="zcm-card__header">
            <h3>Expense Breakdown</h3>
            <button
              className="zcm-btn zcm-btn--secondary zcm-btn--sm"
              onClick={() => navigate('/expenses')}
            >
              View Expenses
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.8125rem' }}>
                <Printer size={15} /> Printing Expense
              </span>
              <strong className="zcm-num">{formatINR(fin?.printing_expense || 0, true)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.8125rem' }}>
                <Bus size={15} /> Bus Fare Advanced
              </span>
              <strong className="zcm-num">{formatINR(fin?.bus_fare || 0, true)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.8125rem' }}>
                <Utensils size={15} /> Student Food Expenses
              </span>
              <strong className="zcm-num">{formatINR(fin?.food_expense || 0, true)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #1E293B' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#CBD5E1' }}>Total Operational Outflow</span>
              <strong className="zcm-num" style={{ color: '#F87171' }}>
                {formatINR((parseFloat(fin?.total_trip_expenses || '0') + parseFloat(fin?.general_expenses || '0')), true)}
              </strong>
            </div>
          </div>
        </div>

        {/* Inventory Movements Overview */}
        <div className="zcm-card">
          <div className="zcm-card__header">
            <h3>Inventory Balance</h3>
            <button
              className="zcm-btn zcm-btn--secondary zcm-btn--sm"
              onClick={() => navigate('/inventory')}
            >
              Stock Ledger
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Opening Printed Batch</span>
              <strong className="zcm-num">{inv?.printed_quantity || 0} calendars</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Confirmed Sales Settled</span>
              <strong className="zcm-num" style={{ color: '#34D399' }}>{inv?.calendars_sold || 0} calendars</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Currently Distributed (Open)</span>
              <strong className="zcm-num" style={{ color: '#FBBF24' }}>{inv?.calendars_in_field || 0} calendars</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #1E293B' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#CBD5E1' }}>Available Stock In Hand</span>
              <strong className="zcm-num" style={{ color: '#38BDF8', fontSize: '1rem' }}>{inv?.available_stock || 0} calendars</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
