import React from 'react'

const HomePageLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <main>
      {children}
    </main>
  )
}

export default HomePageLayout