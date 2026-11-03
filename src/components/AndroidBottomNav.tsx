import React from 'react';
import { 
  Inbox, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  Activity,
  PhoneCall
} from 'lucide-react';
import { NavTab } from './Navbar';
import { haptics } from '../utils/haptics';

interface AndroidBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  voicemailCount: number;
  leadCount: number;
  hazardCount: number;
  onOpenLiveCall: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  voicemailCount,
  leadCount,
  hazardCount,
  onOpenLiveCall,
}) => {
  const handleTabClick = (tab: NavTab) => {
    haptics.tap();
    onTabChange(tab);
  };

  const navItems: { tab: NavTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    {
      tab: 'inbox',
      label: 'Voicemails',
      icon: Inbox,
      count: voicemailCount,
      badgeColor: 'bg-emerald-600',
    },
    {
      tab: 'leads',
      label: 'Dispatch',
      icon: TrendingUp,
      count: leadCount,
      badgeColor: 'bg-indigo-600',
    },
    {
      tab: 'contacts',
      label: 'Clients',
      icon: Users,
    },
    {
      tab: 'hazards',
      label: 'Hazards',
      icon: ShieldAlert,
      count: hazardCount,
      badgeColor: 'bg-red-500',
    },
    {
      tab: 'audit',
      label: 'Audits',
      icon: Activity,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe md:hidden">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const IconComponent = item.icon;

          return (
            <button
              key={item.tab}
              onClick={() => handleTabClick(item.tab)}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-transform active:scale-95 group focus:outline-hidden"
              aria-label={item.label}
            >
              {/* Material 3 active pill background */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                    : 'text-stone-500 group-hover:text-stone-800'
                }`}
              >
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-800' : ''}`} />

                {/* Badge Counter */}
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${
                      item.badgeColor || 'bg-emerald-600'
                    }`}
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight font-medium transition-colors ${
                  isActive ? 'text-emerald-950 font-bold' : 'text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android Gesture Bar */}
      <div className="flex justify-center pb-1">
        <div className="w-32 h-1 bg-stone-300 rounded-full"></div>
      </div>
    </nav>
  );
};
