import { useState, useCallback } from 'react';

// Move components outside to prevent re-creation on every render
const TestSection = ({ title, children }) => (
  <div className="rounded-xl border border-border/60 bg-card p-6 mb-6 shadow-sm">
    <h2 className="mt-0 mb-4 text-xl font-semibold text-foreground">
      {title}
    </h2>
    {children}
  </div>
);

const ResultDisplay = ({ result, label }) => {
  if (!result) return null;
  
  const isSuccess = result.ok === true;
  return (
    <div className={`mt-4 p-4 rounded-md border ${
      isSuccess 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className={`font-semibold mb-2 ${
        isSuccess ? 'text-green-700' : 'text-red-700'
      }`}>
        {label}: {isSuccess ? '✓ Success' : '✗ Failed'}
      </div>
      <pre className="m-0 text-sm overflow-auto max-h-96 bg-background p-3 rounded border border-border/60 text-foreground">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

const Button = ({ onClick, loading, children, variant = 'primary', disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading || disabled}
    className={`px-4 py-2 rounded-md border-none cursor-pointer font-medium text-sm transition-all ${
      loading || disabled
        ? 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground'
        : variant === 'primary'
        ? 'bg-primary text-primary-foreground hover:opacity-90'
        : 'bg-secondary text-secondary-foreground hover:opacity-90'
    }`}
  >
    {loading ? 'Loading...' : children}
  </button>
);

export default function TestServiceM8() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [formData, setFormData] = useState({
    company: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postcode: '',
    },
    job: {
      company_uuid: '',
      description: '',
      scheduled_start_date: '',
      scheduled_end_date: '',
      status: 'Quote',
    },
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleCompanyChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value }
    }));
  }, []);

  const handleJobChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      job: { ...prev.job, [field]: value }
    }));
  }, []);

  const updateLoading = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const updateResult = (key, value) => {
    setResults(prev => ({ ...prev, [key]: value }));
  };

  const testConnection = async () => {
    updateLoading('connection', true);
    try {
      const res = await fetch('/api/servicem8/test');
      const data = await res.json();
      updateResult('connection', data);
    } catch (error) {
      updateResult('connection', { ok: false, error: error.message });
    } finally {
      updateLoading('connection', false);
    }
  };

  const testGetJobs = async () => {
    updateLoading('getJobs', true);
    try {
      const res = await fetch('/api/servicem8/jobs');
      const data = await res.json();
      updateResult('getJobs', data);
    } catch (error) {
      updateResult('getJobs', { ok: false, error: error.message });
    } finally {
      updateLoading('getJobs', false);
    }
  };

  const testGetCompanies = async () => {
    updateLoading('getCompanies', true);
    try {
      const res = await fetch('/api/servicem8/companies');
      const data = await res.json();
      updateResult('getCompanies', data);
    } catch (error) {
      updateResult('getCompanies', { ok: false, error: error.message });
    } finally {
      updateLoading('getCompanies', false);
    }
  };

  const testCreateCompany = async () => {
    updateLoading('createCompany', true);
    try {
      const res = await fetch('/api/servicem8/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.company),
      });
      const data = await res.json();
      updateResult('createCompany', data);
      // Refresh companies list after creation
      if (data.ok) {
        setTimeout(testGetCompanies, 500);
      }
    } catch (error) {
      updateResult('createCompany', { ok: false, error: error.message });
    } finally {
      updateLoading('createCompany', false);
    }
  };

  const testCreateJob = async () => {
    updateLoading('createJob', true);
    try {
      const res = await fetch('/api/servicem8/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.job),
      });
      const data = await res.json();
      updateResult('createJob', data);
      // Refresh jobs list after creation
      if (data.ok) {
        setTimeout(testGetJobs, 500);
      }
    } catch (error) {
      updateResult('createJob', { ok: false, error: error.message });
    } finally {
      updateLoading('createJob', false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          ServiceM8 Integration Test
        </h1>
        <p className="text-muted-foreground text-sm">
          Test your ServiceM8 API integration. Make sure your API key is configured in <code className="bg-muted px-1 py-0.5 rounded">.env</code>
        </p>
      </div>

      {/* Connection Test */}
      <TestSection title="1. Connection Test">
        <p className="text-muted-foreground text-sm mb-4">
          Verify that your ServiceM8 API key is configured and working.
        </p>
        <Button 
          onClick={testConnection} 
          loading={loading.connection}
        >
          Test Connection
        </Button>
        <ResultDisplay result={results.connection} label="Connection" />
      </TestSection>

      {/* Get Data Tests */}
      <TestSection title="2. Fetch Data">
        <div className="flex gap-4 mb-4">
          <Button 
            onClick={testGetCompanies} 
            loading={loading.getCompanies}
          >
            Get Companies
          </Button>
          <Button 
            onClick={testGetJobs} 
            loading={loading.getJobs}
          >
            Get Jobs
          </Button>
        </div>
        <ResultDisplay result={results.getCompanies} label="Companies" />
        <ResultDisplay result={results.getJobs} label="Jobs" />
      </TestSection>

      {/* Create Company */}
      <TestSection title="3. Create Company">
        <p className="text-muted-foreground text-sm mb-4">
          Create a new company (client) in ServiceM8.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company.name}
              onChange={(e) => handleCompanyChange('name', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={formData.company.email}
              onChange={(e) => handleCompanyChange('email', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="contact@acme.com"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              type="tel"
              value={formData.company.phone}
              onChange={(e) => handleCompanyChange('phone', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="0412345678"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Address
            </label>
            <input
              type="text"
              value={formData.company.address}
              onChange={(e) => handleCompanyChange('address', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="123 Main St"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              City
            </label>
            <input
              type="text"
              value={formData.company.city}
              onChange={(e) => handleCompanyChange('city', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="Sydney"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              State
            </label>
            <input
              type="text"
              value={formData.company.state}
              onChange={(e) => handleCompanyChange('state', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="NSW"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Postcode
            </label>
            <input
              type="text"
              value={formData.company.postcode}
              onChange={(e) => handleCompanyChange('postcode', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="2000"
            />
          </div>
        </div>
        <Button 
          onClick={testCreateCompany} 
          loading={loading.createCompany}
          disabled={!formData.company.name}
        >
          Create Company
        </Button>
        <ResultDisplay result={results.createCompany} label="Create Company" />
      </TestSection>

      {/* Create Job */}
      <TestSection title="4. Create Job">
        <p className="text-muted-foreground text-sm mb-4">
          Create a new job in ServiceM8. You'll need a company UUID from the companies list above.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Company UUID *
            </label>
            <input
              type="text"
              value={formData.job.company_uuid}
              onChange={(e) => handleJobChange('company_uuid', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="Copy from companies list above"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Job Status *
            </label>
            <select
              value={formData.job.status}
              onChange={(e) => handleJobChange('status', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
            >
              <option value="Quote">Quote</option>
              <option value="Work Order">Work Order</option>
              <option value="Completed">Completed</option>
              <option value="Unsuccessful">Unsuccessful</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Description
            </label>
            <input
              type="text"
              value={formData.job.description}
              onChange={(e) => handleJobChange('description', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              placeholder="Install Ajax security system"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Scheduled Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.job.scheduled_start_date}
              onChange={(e) => handleJobChange('scheduled_start_date', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Scheduled End Date
            </label>
            <input
              type="datetime-local"
              value={formData.job.scheduled_end_date}
              onChange={(e) => handleJobChange('scheduled_end_date', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
            />
          </div>
        </div>
        <Button 
          onClick={testCreateJob} 
          loading={loading.createJob}
          disabled={!formData.job.company_uuid}
        >
          Create Job
        </Button>
        <ResultDisplay result={results.createJob} label="Create Job" />
      </TestSection>

      {/* Instructions */}
      <div className="mt-8 p-6 rounded-xl border border-secondary/30 bg-secondary/10">
        <h3 className="mt-0 text-base font-semibold text-secondary mb-3">
          How to Use This Test Page
        </h3>
        <ol className="text-secondary/80 text-sm leading-relaxed pl-6 space-y-1">
          <li><strong>Test Connection:</strong> Click "Test Connection" to verify your API key is working.</li>
          <li><strong>Fetch Data:</strong> Click "Get Companies" or "Get Jobs" to see existing data from ServiceM8.</li>
          <li><strong>Create Company:</strong> Fill in the company form and click "Create Company" to add a new client.</li>
          <li><strong>Create Job:</strong> Copy a company UUID from the companies list, paste it in the job form, and create a job.</li>
          <li><strong>Check Results:</strong> Each action shows a result panel with the API response. Green = success, Red = error.</li>
        </ol>
        <p className="text-secondary/80 text-sm mt-4 mb-0">
          <strong>Note:</strong> Make sure your <code className="bg-muted px-1 py-0.5 rounded">SERVICEM8_API_KEY</code> is set in your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file.
        </p>
      </div>
    </div>
  );
}
