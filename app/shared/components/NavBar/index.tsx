import React from 'react'
import Logo from '../Icons/Logo'

const NavBar = () => {
  return (
    <nav className='fixed bg-[#fcfd67] top-0 left-0 px-4 z-20 w-full'>
      <div className="logo py-5">
        <Logo />
      </div>
    </nav>
  )
}

export default NavBar