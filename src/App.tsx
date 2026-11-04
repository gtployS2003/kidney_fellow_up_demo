import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import Home from '@/pages/Home';
import RecipientDashboard from '@/modules/recipient/pages/RecipientDashboard';
import RecipientRegister from '@/modules/recipient/pages/RecipientRegister';
import RecipientList from '@/modules/recipient/pages/RecipientList';
import PatientSummary from '@/modules/recipient/pages/PatientSummary';
import DonorDashboard from '@/modules/donor/pages/DonorDashboard';
import DonorRegister from '@/modules/donor/pages/DonorRegister';
import DonorList from '@/modules/donor/pages/DonorList';
import DonorSummary from '@/modules/donor/pages/DonorSummary';
import MatchingDashboard from '@/modules/matching/pages/MatchingDashboard';
import HlaSearch from '@/modules/matching/pages/HlaSearch';
import InProgress from '@/modules/matching/pages/InProgress';
import SendList from '@/modules/matching/pages/SendList';
import MatchHistory from '@/modules/matching/pages/MatchHistory';
import AppointmentCalendar from '@/modules/appointments/pages/AppointmentCalendar';
import ReportsHub from '@/modules/reports/pages/ReportsHub';
import ReportDetail from '@/modules/reports/pages/ReportDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/clinical" element={<AppShell />}>
        <Route index element={<Navigate to="recipients" replace />} />
        {/* Module: Recipient */}
        <Route path="recipients" element={<RecipientDashboard />} />
        <Route path="recipients/register" element={<RecipientRegister />} />
        <Route path="recipients/list" element={<RecipientList />} />
        <Route path="recipients/:id" element={<PatientSummary />} />
        {/* Module: Donor */}
        <Route path="donors" element={<DonorDashboard />} />
        <Route path="donors/register" element={<DonorRegister />} />
        <Route path="donors/list" element={<DonorList />} />
        <Route path="donors/:id" element={<DonorSummary />} />
        {/* Module: Matching */}
        <Route path="matching" element={<MatchingDashboard />} />
        <Route path="matching/hla" element={<HlaSearch />} />
        <Route path="matching/in-progress" element={<InProgress />} />
        <Route path="matching/send" element={<SendList />} />
        <Route path="matching/history" element={<MatchHistory />} />
        {/* Module: Appointments / Reports */}
        <Route path="appointments" element={<AppointmentCalendar />} />
        <Route path="reports" element={<ReportsHub />} />
        <Route path="reports/:key" element={<ReportDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
