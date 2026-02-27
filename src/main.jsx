import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import Login from './Login.jsx'
import Register from './Register.jsx'
import { Provider } from 'react-redux'
import { store } from './Store/store.js'
import Payal from "./Upload.jsx"
import AiResumeEditor from "./Aiedit.jsx"
import AtsChecker from "./ATSscore.jsx"
import Home from './App.jsx'
// import AtsResumeTemplate from "./Template.jsx"
import PricingSection from './Price.jsx'
// import ResumeExactTemplate from './Template.jsx'
// import ResumePremiumTemplate from './Template.jsx'
import Payment from './Payment.jsx'
import PaymentResult from './Paymentresult.jsx'
// import ResumeEditor from './Editor.jsx'
import Profile from './Profile.jsx'
import Contact from './Contact.jsx'
import About from './About.jsx'
import TemplatesPage from './Templates.jsx'
import TemplatesDesignPage from './TemplatesDesign.jsx'
import PortfolioPage from './Portfolio.jsx'
import { Analytics } from "@vercel/analytics/react"
import { registerSW } from 'virtual:pwa-register'
import { ToastProvider } from './context/ToastContext'
import UpPage from './up.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import Makeadminpage from './Makeadminpage.jsx'
import VideoCallInterviews from './VideoCallInterviews.jsx'
import VideoCallInterviewCreate from './VideoCallInterviewCreate.jsx'
import VideoCallInterviewDetail from './VideoCallInterviewDetail.jsx'
import LiveInterviewCall from './LiveInterviewCall.jsx'
import AIInterviewCall from './AIInterviewCall.jsx'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline")
  },
})


const route = createBrowserRouter([
  {
    path : "/" ,
    element : <Home />
  },

 {
    path : "/dashboard" ,
    element : <Dashboard />
 } ,
 {
  path : "/login" ,
   element : <Login />
 },
 {
  path : "/register" ,
  element  : <Register />
 } ,
 {
  path : "/upload" ,
   element : <Payal />
 } ,
 {
  path : "/aiedit" ,
   element  : <AiResumeEditor />
 },
 {
  path : "/atsscore" ,
  element : <AtsChecker />
 },
 {
  path: "/templates",
  element: <Outlet />,
  children: [
     { index: true, element: <TemplatesPage /> },
    { path: "design", element: <TemplatesDesignPage /> },
  ],
 },
 {
  path : "/price",
  element : <PricingSection />
 },
 {
  path : "/payment",
  element : <Payment />
 },
 {
  path : "/payment-success",
  element : <PaymentResult />
 },
 {
  path: "/contact",
  element: <Contact />,
 },
 {
  path: "/about",
  element: <About />,
 },
 {
  path: "/dashboard/profile",
  element: <Profile />,
 },
 {
  path: "/portfolio",
  element: <PortfolioPage />,
 },
 {
  path: "/up",
  element: <UpPage />,
 },
 {
  path: "/admin-dashboard",
  element: <AdminDashboard />,
 },
 {
  path: "/make-admin",
  element: <Makeadminpage />,
 },
 {
  path: "/dashboard/interviews",
  element: <VideoCallInterviews />,
 },
 {
  path: "/dashboard/interviews/new",
  element: <VideoCallInterviewCreate />,
 },
 {
  path: "/dashboard/interviews/:id",
  element: <VideoCallInterviewDetail />,
 },
 {
  path: "/dashboard/interviews/:id/call",
  element: <LiveInterviewCall />,
 },
 {
  path: "/dashboard/interviews/:id/ai-call",
  element: <AIInterviewCall />,
 },

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <RouterProvider router={route} />
        <Analytics />
      </ToastProvider>
    </Provider>
  </StrictMode>,
)
