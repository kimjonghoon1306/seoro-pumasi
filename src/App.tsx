import { Switch, Route, useLocation } from 'wouter'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Missions from './pages/Missions'
import Register from './pages/Register'
import Verify from './pages/Verify'

const ComingSoon = ({ page }: { page: string }) => (
  <div style={{ textAlign: 'center', padding: '80px 20px' }}>
    <div style={{ fontSize: 60, marginBottom: 16 }}>🚧</div>
    <h2 style={{ fontSize: 24, color: 'var(--green)', marginBottom: 12 }}>{page} 페이지</h2>
    <p style={{ color: 'var(--gray-600)', fontSize: 17 }}>곧 만들어질 예정이에요!</p>
  </div>
)

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [, setLocation] = useLocation()
  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, fontSize: 17, color: 'var(--gray-400)' }}>
      잠깐만요, 확인 중이에요... ⏳
    </div>
  )
  if (!user) { setLocation('/login'); return null }
  return <>{children}</>
}

export default function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--green)' }}>
      🌱 서로품앗이 불러오는 중...
    </div>
  )

  return (
    <Layout nickname={user?.nickname} points={user?.points} onLogout={signOut}>
      <Switch>
        <Route path="/"           component={Landing} />
        <Route path="/login"      component={Login} />
        <Route path="/dashboard"> <PrivateRoute><Dashboard /></PrivateRoute></Route>
        <Route path="/missions">  <PrivateRoute><Missions /></PrivateRoute></Route>
        <Route path="/register">  <PrivateRoute><Register /></PrivateRoute></Route>
        <Route path="/verify/:id"><PrivateRoute><Verify /></PrivateRoute></Route>
        <Route path="/admin">     <PrivateRoute><ComingSoon page="관리자" /></PrivateRoute></Route>
        <Route>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>😅</div>
            <h2 style={{ fontSize: 24, color: 'var(--green)' }}>페이지를 찾을 수 없어요</h2>
          </div>
        </Route>
      </Switch>
    </Layout>
  )
}
