import {SideMenu} from "./SideMenu.tsx";

export const PageWithSideMenu = ({ children }) => {
    return (
        <div className={'page-with-side-menu-container'}>
            <div>
                <SideMenu/>
            </div>
            <div className={'page-content-view'}>
                {children}
            </div>
        </div>
    )
}