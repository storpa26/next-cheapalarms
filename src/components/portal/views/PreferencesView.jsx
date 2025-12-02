import { AccountPreferences } from "../sections/AccountSection";
import { mockActivityLog } from "../utils/mock-data";

export function PreferencesView({ view }) {
  // Use actual data if available, otherwise use mock data
  const activityLog = view?.activity || mockActivityLog();

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Your account</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Preferences & Activity</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings, security, and notification preferences.
        </p>
      </div>

      <AccountPreferences />
      
      <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Recent activity</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Account Activity Log</h2>
        <p className="mt-1 text-sm text-slate-500">Track all recent actions on your account.</p>
        
        <div className="mt-6 space-y-3">
          {activityLog.length > 0 ? (
            activityLog.map((entry, index) => (
              <div key={entry.id || index} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                  <p className="text-xs text-slate-500">{entry.description}</p>
                </div>
                {entry.when && (
                  <span className="text-xs text-slate-400">
                    {new Date(entry.when).toLocaleDateString("en-AU")}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-500">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

