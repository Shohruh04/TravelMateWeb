import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DestinationProvider } from './context/DestinationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Accommodations from './pages/Accommodations'
import DestinationDetail from './pages/DestinationDetail'
import Flights from './pages/Flights'
import TouristTools from './pages/TouristTools'
import Premium from './pages/Premium'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Checkout from './components/payment/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'

function App() {
  return (
    <Router>
      <AuthProvider>
        <DestinationProvider>
          <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/accommodations" element={<Layout><Accommodations /></Layout>} />
            <Route path="/destinations/:id" element={<Layout><DestinationDetail /></Layout>} />
            <Route path="/flights" element={<Layout><Flights /></Layout>} />
            <Route path="/tourist-tools" element={<Layout><TouristTools /></Layout>} />
            <Route path="/premium" element={<Layout><Premium /></Layout>} />

            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with layout */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Layout><Account /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Payment routes without layout */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
          </Routes>
        </DestinationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
