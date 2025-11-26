/**
 * Generate ServiceM8 mock data
 * Jobs, Workers, Companies
 */

const workerNames = [
  "Mike Johnson",
  "Sarah Smith",
  "David Chen",
  "Emma Wilson",
  "James Brown",
  "Alex Martinez",
  "Jessica Lee",
];

const companyNames = [
  "ABC Security Systems",
  "XYZ Home Solutions",
  "Premier Alarm Services",
  "Secure Home Pro",
  "Advanced Security Co",
  "Elite Protection",
  "Guardian Security",
];

const addresses = [
  "123 Main St, Melbourne VIC 3000",
  "456 Collins St, Melbourne VIC 3000",
  "789 Bourke St, Melbourne VIC 3000",
  "321 Flinders St, Melbourne VIC 3000",
  "654 Swanston St, Melbourne VIC 3000",
  "987 Elizabeth St, Melbourne VIC 3000",
  "147 King St, Melbourne VIC 3000",
];

const jobTypes = [
  "Installation",
  "Maintenance",
  "Repair",
  "Inspection",
  "Upgrade",
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomTimeAgo() {
  const hours = Math.floor(Math.random() * 8);
  const minutes = Math.floor(Math.random() * 60);
  
  if (hours === 0) return `${minutes}m ago`;
  if (hours === 1) return "1h ago";
  return `${hours}h ago`;
}

function formatHours(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

function getRandomDate() {
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 48);
  return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();
}

// Generate ServiceM8 Jobs
export function generateServiceM8Jobs(count = 12) {
  const jobs = [];
  const statuses = ["Quote", "Scheduled", "In Progress", "Completed", "Cancelled"];
  
  for (let i = 0; i < count; i++) {
    const status = getRandomItem(statuses);
    const worker = status === "In Progress" || status === "Completed" ? getRandomItem(workerNames) : null;
    const company = getRandomItem(companyNames);
    const address = getRandomItem(addresses);
    const jobNumber = Math.floor(Math.random() * 5000) + 1000;
    const jobType = getRandomItem(jobTypes);
    
    let startedAt = null;
    let completedAt = null;
    let scheduledDate = null;
    
    if (status === "In Progress") {
      startedAt = getRandomTimeAgo();
    } else if (status === "Completed") {
      startedAt = `${Math.floor(Math.random() * 24) + 1}h ago`;
      completedAt = getRandomTimeAgo();
    } else if (status === "Scheduled") {
      scheduledDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    }

    jobs.push({
      uuid: `job-${i + 1}-${Date.now()}`,
      jobNumber: `#${jobNumber}`,
      status,
      jobType,
      company,
      companyUuid: `company-${i + 1}`,
      assignedTo: worker,
      assignedToStaffUuid: worker ? `staff-${workerNames.indexOf(worker) + 1}` : null,
      address,
      description: `${jobType} service for ${company}`,
      scheduledStartDate: scheduledDate ? scheduledDate.toISOString() : null,
      scheduledEndDate: scheduledDate ? new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000).toISOString() : null,
      startedAt,
      completedAt,
      createdAt: getRandomDate(),
      photos: status === "Completed" || status === "In Progress" ? Math.floor(Math.random() * 5) : 0,
      notes: status === "In Progress" ? "Work in progress..." : null,
    });
  }

  return jobs.sort((a, b) => {
    const priority = { "In Progress": 1, "Scheduled": 2, "Quote": 3, "Completed": 4, "Cancelled": 5 };
    return priority[a.status] - priority[b.status];
  });
}

// Generate ServiceM8 Workers/Staff
export function generateServiceM8Workers() {
  const workers = [];
  const onlineCount = Math.floor(Math.random() * 4) + 2; // 2-5 online
  
  // Online workers
  for (let i = 0; i < onlineCount; i++) {
    const worker = getRandomItem(workerNames);
    if (workers.find(w => w.name === worker)) continue;
    
    const loginMinutes = Math.floor(Math.random() * 480) + 60; // 1-8 hours
    const assignedJobs = Math.floor(Math.random() * 4) + 1; // 1-4 jobs
    
    workers.push({
      uuid: `staff-${i + 1}`,
      name: worker,
      email: `${worker.toLowerCase().replace(' ', '.')}@cheapalarms.com.au`,
      phone: `04${Math.floor(Math.random() * 90000000) + 10000000}`,
      status: "online",
      clockedIn: true,
      clockedInAt: new Date(Date.now() - loginMinutes * 60 * 1000).toISOString(),
      hoursLoggedToday: formatHours(loginMinutes),
      assignedJobs,
      currentLocation: assignedJobs > 0 ? getRandomItem(addresses) : "Office",
      jobType: assignedJobs > 0 ? getRandomItem(jobTypes) : null,
    });
  }

  // Offline workers
  const offlineCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < offlineCount; i++) {
    const worker = getRandomItem(workerNames.filter(w => !workers.find(wo => wo.name === w)));
    if (!worker) break;
    
    workers.push({
      uuid: `staff-offline-${i + 1}`,
      name: worker,
      email: `${worker.toLowerCase().replace(' ', '.')}@cheapalarms.com.au`,
      phone: `04${Math.floor(Math.random() * 90000000) + 10000000}`,
      status: "offline",
      clockedIn: false,
      clockedInAt: null,
      hoursLoggedToday: "0h 0m",
      assignedJobs: 0,
      currentLocation: "Offline",
      jobType: null,
    });
  }

  return workers;
}

// Generate ServiceM8 Companies
export function generateServiceM8Companies(count = 10) {
  const companies = [];
  
  for (let i = 0; i < count; i++) {
    const company = getRandomItem(companyNames);
    if (companies.find(c => c.name === company)) continue;
    
    const jobCount = Math.floor(Math.random() * 10) + 1;
    const lastJobDate = getRandomDate();
    
    companies.push({
      uuid: `company-${i + 1}`,
      name: company,
      email: `contact@${company.toLowerCase().replace(/\s+/g, '')}.com.au`,
      phone: `03${Math.floor(Math.random() * 90000000) + 10000000}`,
      address: getRandomItem(addresses),
      city: "Melbourne",
      state: "VIC",
      postcode: "3000",
      totalJobs: jobCount,
      activeJobs: Math.floor(Math.random() * 3),
      lastJobDate,
      contactName: `Contact ${i + 1}`,
    });
  }

  return companies;
}

// Generate summary stats
export function generateServiceM8Stats(jobs, workers, companies) {
  const activeJobs = jobs.filter(j => j.status === "In Progress" || j.status === "Scheduled").length;
  const onlineWorkers = workers.filter(w => w.status === "online").length;
  const totalJobs = jobs.length;
  const completedToday = jobs.filter(j => j.status === "Completed" && j.completedAt).length;
  
  return {
    activeJobs,
    onlineWorkers,
    totalJobs,
    completedToday,
    totalCompanies: companies.length,
    totalWorkers: workers.length,
  };
}

