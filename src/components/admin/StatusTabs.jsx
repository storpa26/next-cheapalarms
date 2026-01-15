import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function StatusTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-border/60 bg-surface/30 backdrop-blur-sm">
      <nav className="-mb-px flex space-x-8 px-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              variant="ghost"
              className={`
                whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm rounded-none
                transition-all duration-200 ease-standard relative
                ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/40 hover:bg-muted/30"
                }
              `}
            >
              <span className="flex items-center gap-2 relative z-10">
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className={`text-xs ${isActive ? "bg-primary/20 text-primary border-primary/30" : ""}`}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </span>
              {isActive && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

