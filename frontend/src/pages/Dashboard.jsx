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
        <div class='flex flex-col min-h-screen'>
            <div class='flex items-center space-x-6 my-[5px] top-0 left-0 w-[95%] z-50'>
                <i className="fa-solid fa-otter text-gray-900 text-2xl mx-[15px]"></i>
                <NavigationMenu viewport={false} class='w-full'>
                    <NavigationMenuList class='flex justify-center space-x-[15%]'>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/home">Home</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/request">Request For Payment</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/datalist">Data List</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <NavLink to="/forecasting">Forecasting</NavLink>
                            </NavigationMenuLink>          
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <Outlet/>
            <footer className="border-t bg-gray-50 px-4 py-4 text-center text-sm text-gray-600">
                © 2025 MMCM
            </footer>
        </div>
    );
}

export default Dashboard;