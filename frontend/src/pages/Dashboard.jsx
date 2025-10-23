import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
// shadcn components
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

function Dashboard() {

    return (
        <div className='flex flex-col min-h-screen'>
            <header className='flex items-center space-x-6 my-[5px] top-0 left-0 w-[95%] z-50'>
                <i className="fa-solid fa-otter text-gray-900 text-2xl mx-[15px]"></i>
                <NavigationMenu viewport={false} className='flex w-full max-w-none'>
                    <NavigationMenuList className='w-full justify-between'>
                        <NavigationMenuItem className="flex-1">
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/home">Home</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                        <NavigationMenuItem className="flex-1">
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/request">Request For Payment</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                        <NavigationMenuItem className="flex-1">
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/datalist">Data List</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                        <NavigationMenuItem className="flex-1">
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/forecasting">Forecasting</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                        <NavigationMenuItem className="flex-1">
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/university">University</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </header>
            <main className='flex-1'>
                <Outlet/>
            </main>
            <footer className="border-t bg-gray-50 px-4 py-4 text-center text-sm text-gray-600">
                © 2025 MMCM RFP Forecasting
            </footer>
        </div>
    );
}

export default Dashboard;