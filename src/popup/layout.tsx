import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <div className="w-full h-full bg-internal bg-cover dark overflow-hidden">
            <Outlet />
        </div>
    )
}

export default Layout
