import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  TrendingUp,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { formatINR } from '../../utils/formatters';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export const ReportsPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const [selectedReportType, setSelectedReportType] = useState<'trips' | 'students' | 'expenses' | 'places'>('trips');

  // Query report summary
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-summary', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getReportSummary(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  const fin = reportData?.financial;
  const inv = reportData?.inventory;
  const places = reportData?.places || [];

  const handleDownload = (format: 'excel' | 'csv' | 'pdf', type: string = 'trips') => {
    if (!activeCampaignId) return;
    const url = api.getExportUrl(activeCampaignId, format, type);
    window.open(url, '_blank');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Financial & Operational Reports</h1>
          <div className="zcm-page-header__sub">
            Comprehensive campaign statements, audit sheets, destination performance, and official exports.
          </div>
        </div>

        <div className="zcm-page-header__actions">
          <button
            className="zcm-btn zcm-btn--primary"
            onClick={() => handleDownload('excel', 'full')}
          >
            <FileSpreadsheet size={16} />
            <span>Export Complete Excel (.xlsx)</span>
          </button>
          <button
            className="zcm-btn zcm-btn--secondary"
            onClick={() => handleDownload('pdf', 'full')}
          >
            <Download size={16} />
            <span>Export Official PDF</span>
          </button>
        </div>
      </div>

      {/* Campaign Summary Quick Card */}
      <div className="zcm-card">
        <div className="zcm-card__header">
          <h3>Campaign Financial & Inventory Snapshot ({activeCampaign?.year || ''})</h3>
          <Badge variant={activeCampaign?.status === 'active' ? 'success' : 'neutral'}>
            {activeCampaign?.status.toUpperCase()}
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {parseFloat(fin?.external_collections || '0') > 0 ? 'Total Campaign Received' : 'Total Actual Collections'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981' }}>
              {formatINR(fin?.total_received || fin?.total_collections || 0, true)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {parseFloat(fin?.external_collections || '0') > 0
                ? `Trips: ${formatINR(fin?.student_collections || fin?.total_collections || 0)} | External: ${formatINR(fin?.external_collections || 0)}`
                : `Cash: ${formatINR(fin?.cash_collections || 0)} | GPay: ${formatINR(fin?.gpay_collections || 0)}`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Operational Outflow</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EF4444' }}>
              {formatINR(
                parseFloat(fin?.total_trip_expenses || '0') + parseFloat(fin?.general_expenses || '0'),
                true
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Trip Deductions: {formatINR(fin?.total_trip_expenses || 0)} | General: {formatINR(fin?.general_expenses || 0)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Student Commission Earned</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F59E0B' }}>
              {formatINR(fin?.total_commission_earned || 0, true)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Disbursed: {formatINR(fin?.total_commission_paid || 0)} | Pending: {formatINR(fin?.outstanding_commission || 0)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Net Campaign Profit</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>
              {formatINR(fin?.net_profit || 0, true)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {fin?.is_provisional ? 'Provisional calculation' : 'Finalized profit'}
            </div>
          </div>
        </div>
      </div>

      {/* Destination Performance Table */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={17} style={{ color: '#38BDF8' }} />
            <h3>Destination Distribution & Collection Performance</h3>
          </div>
        </div>

        <div className="zcm-table-container">
          <table className="zcm-table">
            <thead>
              <tr>
                <th>Destination Place</th>
                <th className="zcm-text-right">Trips Conducted</th>
                <th className="zcm-text-right">Calendars Sold</th>
                <th className="zcm-text-right">Total Collected (₹)</th>
                <th className="zcm-text-right">Trip Expenses (₹)</th>
                <th className="zcm-text-right">Net Generated (₹)</th>
                <th className="zcm-text-right">Avg Collection / Trip (₹)</th>
              </tr>
            </thead>
            <tbody>
              {places.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                    No settled trips for destinations recorded yet.
                  </td>
                </tr>
              ) : (
                places.map((p: any) => {
                  const collected = parseFloat(p.total_collected || '0');
                  const expenses = parseFloat(p.total_expenses || '0');
                  const net = collected - expenses;
                  const avg = p.trips_count > 0 ? collected / p.trips_count : 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td className="zcm-text-right zcm-num">{p.trips_count} trips</td>
                      <td className="zcm-text-right zcm-num">{p.total_sold || 0}</td>
                      <td className="zcm-text-right zcm-num">{formatINR(collected, true)}</td>
                      <td className="zcm-text-right zcm-num">{formatINR(expenses, true)}</td>
                      <td className="zcm-text-right zcm-num">
                        <strong style={{ color: net >= 0 ? '#34D399' : '#EF4444' }}>
                          {formatINR(net, true)}
                        </strong>
                      </td>
                      <td className="zcm-text-right zcm-num">{formatINR(avg, true)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Sectional Downloads */}
      <div className="zcm-card">
        <div className="zcm-card__header">
          <h3>Individual CSV Exports</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="zcm-btn zcm-btn--secondary"
            onClick={() => handleDownload('csv', 'trips')}
          >
            <Download size={15} />
            <span>Download Trips CSV</span>
          </button>
          <button
            className="zcm-btn zcm-btn--secondary"
            onClick={() => handleDownload('csv', 'students')}
          >
            <Download size={15} />
            <span>Download Students & Commission CSV</span>
          </button>
          <button
            className="zcm-btn zcm-btn--secondary"
            onClick={() => handleDownload('csv', 'expenses')}
          >
            <Download size={15} />
            <span>Download Expenses CSV</span>
          </button>
          <button
            className="zcm-btn zcm-btn--secondary"
            onClick={() => handleDownload('csv', 'external_collections')}
          >
            <Download size={15} />
            <span>Download External Collections CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
