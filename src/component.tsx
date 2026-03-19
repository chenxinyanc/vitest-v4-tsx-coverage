import React from 'react'

interface StatusProps {
  isLoggedIn: boolean
  isAdmin: boolean
  username: string
}

export const StatusMessage: React.FC<StatusProps> = ({ isLoggedIn, isAdmin, username }) => {
  return (
    <div>
      {isLoggedIn ? (
        <span>Welcome, {username}!</span>
      ) : (
        <span>Please log in.</span>
      )}
      {isAdmin && <span> (Admin)</span>}
    </div>
  )
}
