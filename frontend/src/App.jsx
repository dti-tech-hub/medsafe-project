import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { Layout } from './components/Layout'
import { MedicinesProvider } from './context/MedicinesProvider'
import AdminPage from './pages/AdminPage'
import CheckPage from './pages/CheckPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MedicineDetailPage from './pages/MedicineDetailPage'
import MyMedicinesPage from './pages/MyMedicinesPage'
import NotFoundPage from './pages/NotFoundPage'
import SearchPage from './pages/SearchPage'
import SourcesPage from './pages/SourcesPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MedicinesProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="medicine/:medicineId" element={<MedicineDetailPage />} />
              <Route path="my-medicines" element={<MyMedicinesPage />} />
              <Route path="check" element={<CheckPage />} />
              <Route path="sources" element={<SourcesPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </MedicinesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
