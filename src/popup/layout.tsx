import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <div className="h-full w-screen bg-main bg-cover dark flex justify-center dark overflow-y-auto">
            <Outlet />
        </div>
    )
}

export default Layout
