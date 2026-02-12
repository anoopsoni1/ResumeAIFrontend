import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
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
import ResumePremiumTemplate from './Template.jsx'
import Payment from './Payment.jsx'
import PaymentResult from './Paymentresult.jsx'
import ResumeEditor from './Editor.jsx'
// import Profile from './Profile.jsx'
import Contact from './Contact.jsx'
import About from './About.jsx'

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
  path : "/Template" ,
  element : <ResumePremiumTemplate />
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
  path : "/editor",
  element : <ResumeEditor />
 },
 {
  path: "/contact",
  element: <Contact />,
 },
 {
  path: "/about",
  element: <About />,
 },

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
 <RouterProvider  router={route} />
 </Provider>
  </StrictMode>,
)
