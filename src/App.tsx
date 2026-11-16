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
import ArticleList from '@/modules/articles/pages/ArticleList';
import ArticleEditor from '@/modules/articles/pages/ArticleEditor';
import LineSimulator from '@/modules/line/LineSimulator';
import UseCasePage from '@/modules/usecase/UseCasePage';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* เดโม LINE OA (จำลอง ไม่เชื่อม LINE จริง) */}
      <Route path="/line" element={<LineSimulator />} />
      <Route path="/usecase" element={<UseCasePage />} />
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
        {/* Phase 1: บทความความรู้ (แสดงใน LINE OA) */}
        <Route path="articles" element={<ArticleList />} />
        <Route path="articles/:id" element={<ArticleEditor />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound standalone />} />
    </Routes>
  );
}
