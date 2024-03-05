import Header from '../../components/landing-page/Header'
import React from 'react'

const HomePageLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <main>
      <Header/>
      {children}
      
    </main>
  )
}

export default HomePageLayout