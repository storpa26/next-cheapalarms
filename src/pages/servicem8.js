import Head from "next/head";
import { useState, useEffect } from "react";
import AdminLayout from "../components/admin/layout/AdminLayout";
import { isAuthenticated, getLoginRedirect } from "../lib/auth";
import {
  generateServiceM8Jobs,
  generateServiceM8Workers,
  generateServiceM8Companies,
  generateServiceM8Stats,
} from "../lib/mocks/servicem8";
import JobsSection from "../components/servicem8/JobsSection";
import WorkersSection from "../components/servicem8/WorkersSection";
import CompaniesSection from "../components/servicem8/CompaniesSection";
import StatsCards from "../components/servicem8/StatsCards";

export default function ServiceM8Page() {
  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const jobsData = generateServiceM8Jobs(15);
      const workersData = generateServiceM8Workers();
      const companiesData = generateServiceM8Companies(12);
      const statsData = generateServiceM8Stats(jobsData, workersData, companiesData);

      setJobs(jobsData);
      setWorkers(workersData);
      setCompanies(companiesData);
      setStats(statsData);
      setLoading(false);
    }, 800);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "jobs", label: "Jobs", icon: "📋" },
    { id: "workers", label: "Workers", icon: "👥" },
    { id: "companies", label: "Companies", icon: "🏢" },
  ];

  return (
    <>
      <Head>
        <title>ServiceM8 Integration • CheapAlarms</title>
      </Head>
      <AdminLayout title="ServiceM8 Integration">
        <div className="relative min-h-screen overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 size-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 size-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-pink-500/5 blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  ServiceM8 Integration
                </h1>
                <p className="text-muted-foreground mt-2">
                  Real-time field operations and job management
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} loading={loading} />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border/50 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <JobsSection jobs={jobs.slice(0, 6)} loading={loading} />
                  </div>
                  <WorkersSection workers={workers} loading={loading} />
                  <CompaniesSection companies={companies.slice(0, 6)} loading={loading} />
                </div>
              )}

              {activeTab === "jobs" && (
                <JobsSection jobs={jobs} loading={loading} />
              )}

              {activeTab === "workers" && (
                <WorkersSection workers={workers} loading={loading} />
              )}

              {activeTab === "companies" && (
                <CompaniesSection companies={companies} loading={loading} />
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/servicem8"),
        permanent: false,
      },
    };
  }
  return { props: {} };
}

