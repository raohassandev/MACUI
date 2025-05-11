import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/navigation/Button';

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const ThemeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const ComponentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9.5V4a2 2 0 0 1 2-2h3.5" />
    <path d="M9.5 2H14" />
    <path d="M19.5 2H20a2 2 0 0 1 2 2v3.5" />
    <path d="M22 14v1.5" />
    <path d="M22 19.5V20a2 2 0 0 1-2 2h-3.5" />
    <path d="M14.5 22H9.5" />
    <path d="M4.5 22H4a2 2 0 0 1-2-2v-3.5" />
    <path d="M2 14v-1.5" />
    <path d="M12 13a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z" />
    <path d="M11 9.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z" />
    <path d="M7.5 13a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z" />
    <path d="M11 16.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z" />
    <path d="M16.5 13a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CollapseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 6-6 6 6 6" />
  </svg>
);

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}

interface EngineerSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, collapsed }) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={`w-full justify-${collapsed ? 'center' : 'start'} mb-1 ${isActive ? "bg-primary text-primary-foreground" : ""}`}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed ? '' : 'mr-2'}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Button>
  );
};

export const EngineerSidebar: React.FC<EngineerSidebarProps> = ({ onCollapseChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    // Store collapse state in localStorage
    localStorage.setItem('sidebarCollapsed', String(newCollapsedState));

    // Notify parent component about collapse state change
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };
  
  return (
    <div className="relative">
      {/* Menu toggle button for mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar} className="bg-background shadow-md">
          <MenuIcon />
        </Button>
      </div>
      
      {/* Collapse toggle button (desktop only, visible when sidebar is open) */}
      <div className={`hidden md:block fixed ${isCollapsed ? 'left-[72px]' : 'left-[240px]'} top-4 z-50 transition-all duration-300`}>
        <Button variant="outline" size="icon" onClick={toggleCollapse} className="bg-background shadow-md">
          {isCollapsed ? (
            // Expand icon (right arrow)
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            // Collapse icon (left arrow)
            <CollapseIcon />
          )}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full z-20
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-16' : 'md:w-64'}
          bg-background border-r border-border shadow-md
          p-4
        `}
      >
        <div className={`mt-14 space-y-1 mb-8 ${isCollapsed ? 'px-0' : 'px-2'}`}>
          <NavItem
            to="/dashboards"
            icon={<DashboardIcon />}
            label="Dashboards"
            isActive={isActive("/dashboard")}
            onClick={() => handleNavigate("/dashboards")}
            collapsed={isCollapsed}
          />
          
          <NavItem
            to="/theme-settings"
            icon={<ThemeIcon />}
            label="Theme Settings"
            isActive={isActive("/theme-settings")}
            onClick={() => handleNavigate("/theme-settings")}
            collapsed={isCollapsed}
          />
          
          <NavItem
            to="/components"
            icon={<ComponentsIcon />}
            label="Component Demo"
            isActive={isActive("/components")}
            onClick={() => handleNavigate("/components")}
            collapsed={isCollapsed}
          />
        </div>
        
        {/* Close button (mobile only) */}
        <div className="md:hidden mt-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={toggleSidebar}
          >
            Close Menu
          </Button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-0"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default EngineerSidebar;