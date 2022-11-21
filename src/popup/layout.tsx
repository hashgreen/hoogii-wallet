import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <div className="container flex flex-col justify-between h-full bg-main">
            <Outlet />
        </div>
    )
}

export default Layout
