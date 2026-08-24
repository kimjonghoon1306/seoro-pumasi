import { Switch, Route, useLocation } from 'wouter'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Missions from './pages/Missions'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import MyPage from './pages/MyPage'
import Community from './pages/Community'
import FindPassword from './pages/FindPassword'
import ResetPassword from './pages/ResetPassword'
import FindEmail    from './pages/FindEmail'
import { useEffect } from 'react'

// 관리자 라우트는 Layout 없이 단독 렌더
function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin"       component={Admin} />
    </Switch>
  )
}

const ComingSoon = ({ page }: { page: string }) => (
  <div style={{ textAlign: 'center', padding: '80px 20px' }}>
    <div style={{ fontSize: 60, marginBottom: 16 }}>🚧</div>
    <h2 style={{ fontSize: 24, color: 'var(--g500)', marginBottom: 12 }}>{page} 페이지</h2>
    <p style={{ color: 'var(--text-muted)', fontSize: 17 }}>곧 만들어질 예정이에요!</p>
  </div>
)

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!loading && !user) setLocation('/login')
  }, [user, loading, setLocation])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, fontSize: 17, color: 'var(--text-muted)' }}>
      잠깐만요, 확인 중이에요... ⏳
    </div>
  )
  if (!user) return null
  return <>{children}</>
}

export default function App() {
  const [location] = useLocation()

  // /admin, /admin-login → Layout 없이 단독 렌더
  if (location.startsWith('/admin')) {
    return <AdminRoutes />
  }

  return <AppWithLayout />
}

function AppWithLayout() {
  const { user, loading, signOut } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 18, color: 'var(--g500)',
    }}>
      🌱 서로품앗이 불러오는 중...
    </div>
  )

  return (
    <Layout nickname={user?.nickname} points={user?.points} userId={user?.id} onLogout={signOut}>
      <Switch>
        <Route path="/"              component={Landing} />
        <Route path="/login"         component={Login} />
        <Route path="/find-password"  component={FindPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/find-email"    component={FindEmail} />
        <Route path="/dashboard">    <PrivateRoute><Dashboard /></PrivateRoute></Route>
        <Route path="/missions">     <PrivateRoute><Missions /></PrivateRoute></Route>
        <Route path="/register">     <PrivateRoute><Register /></PrivateRoute></Route>
        <Route path="/verify/:id">   <PrivateRoute><Verify /></PrivateRoute></Route>
        <Route path="/mypage">       <PrivateRoute><MyPage /></PrivateRoute></Route>
        <Route path="/community">    <PrivateRoute><Community /></PrivateRoute></Route>
        <Route>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>😅</div>
            <h2 style={{ fontSize: 24, color: 'var(--g500)' }}>페이지를 찾을 수 없어요</h2>
          </div>
        </Route>
      </Switch>
    </Layout>
  )
}
