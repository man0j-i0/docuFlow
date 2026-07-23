import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/AppLayout'
import { ProtectedRoute } from '@/app/routes/ProtectedRoute'
import { RoleRoute } from '@/app/routes/RoleRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { useAuthBootstrap } from '@/features/auth/useAuth'
import { HomePage } from '@/pages/HomePage'

function AdminPage() {
  return <p>Admin area — admins only.</p>
}
function ReviewPage() {
  return <p>Review queue — admins and reviewers.</p>
}
function AuditPage() {
  return <p>Audit log — admins and auditors.</p>
}

export default function App() {
  useAuthBootstrap()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route element={<RoleRoute allow={['admin', 'reviewer']} />}>
            <Route path="/review" element={<ReviewPage />} />
          </Route>

          <Route element={<RoleRoute allow={['admin', 'auditor']} />}>
            <Route path="/audit" element={<AuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
