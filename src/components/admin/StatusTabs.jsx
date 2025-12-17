import { Button } from '@/components/ui/button';

export function StatusTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              variant="ghost"
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-none
                transition-colors duration-200
                ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }
              `}
            >
              {tab.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

