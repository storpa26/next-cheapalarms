/**
 * Generate practical operations data for the activity feed
 * Focus: Active Jobs, Workers, Customers, Events
 */

const workerNames = [
  "Mike Johnson",
  "Sarah Smith",
  "David Chen",
  "Emma Wilson",
  "James Brown",
];

const customerNames = [
  "John Doe",
  "Jane Smith",
  "Robert Williams",
  "Lisa Anderson",
  "Michael Taylor",
];

const companyNames = [
  "ABC Security Systems",
  "XYZ Home Solutions",
  "Premier Alarm Services",
  "Secure Home Pro",
  "Advanced Security Co",
];

const addresses = [
  "123 Main St, Melbourne VIC 3000",
  "456 Collins St, Melbourne VIC 3000",
  "789 Bourke St, Melbourne VIC 3000",
  "321 Flinders St, Melbourne VIC 3000",
  "654 Swanston St, Melbourne VIC 3000",
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

function getRandomDate() {
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 8);
  return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();
}

function formatHours(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

// Generate Active Jobs
export function generateActiveJobs(count = 8) {
  const jobs = [];
  const statuses = ["In Progress", "Scheduled", "Quote"];
  
  for (let i = 0; i < count; i++) {
    const status = getRandomItem(statuses);
    const worker = getRandomItem(workerNames);
    const company = getRandomItem(companyNames);
    const address = getRandomItem(addresses);
    const jobNumber = Math.floor(Math.random() * 5000) + 1000;
    const startedAgo = status === "In Progress" ? getRandomTimeAgo() : null;
    const scheduledTime = status === "Scheduled" 
      ? new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
      : null;

    jobs.push({
      id: `job-${i + 1}`,
      jobNumber: `#${jobNumber}`,
      status,
      worker,
      company,
      address,
      customer: getRandomItem(customerNames),
      startedAgo,
      scheduledTime,
      estimatedDuration: `${Math.floor(Math.random() * 4) + 2}h`,
      createdAt: getRandomDate(),
    });
  }

  return jobs.sort((a, b) => {
    // Sort: In Progress first, then Scheduled, then Quote
    const priority = { "In Progress": 1, "Scheduled": 2, "Quote": 3 };
    return priority[a.status] - priority[b.status];
  });
}

// Generate Worker Status
export function generateWorkerStatus() {
  const workers = [];
  const loggedInCount = Math.floor(Math.random() * 3) + 2; // 2-4 workers online
  
  for (let i = 0; i < loggedInCount; i++) {
    const worker = getRandomItem(workerNames);
    const loginMinutes = Math.floor(Math.random() * 480) + 60; // 1-8 hours
    const assignedJobs = Math.floor(Math.random() * 3) + 1; // 1-3 jobs
    
    workers.push({
      id: `worker-${i + 1}`,
      name: worker,
      status: "online",
      hoursLoggedIn: formatHours(loginMinutes),
      loginTime: new Date(Date.now() - loginMinutes * 60 * 1000).toISOString(),
      assignedJobs,
      currentJob: assignedJobs > 0 ? `Job #${Math.floor(Math.random() * 5000) + 1000}` : null,
      location: assignedJobs > 0 ? getRandomItem(addresses) : "Available",
    });
  }

  // Add some offline workers
  const offlineCount = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < offlineCount; i++) {
    const worker = getRandomItem(workerNames.filter(w => !workers.find(wo => wo.name === w)));
    if (worker) {
      workers.push({
        id: `worker-offline-${i + 1}`,
        name: worker,
        status: "offline",
        hoursLoggedIn: "0h 0m",
        loginTime: null,
        assignedJobs: 0,
        currentJob: null,
        location: "Offline",
      });
    }
  }

  return workers;
}

// Generate Customer Activity
export function generateCustomerActivity(count = 10) {
  const activities = [];
  
  for (let i = 0; i < count; i++) {
    const customer = getRandomItem(customerNames);
    const company = getRandomItem(companyNames);
    const activityType = getRandomItem([
      "login",
      "estimate_confirmed",
      "order_placed",
      "portal_accessed",
    ]);

    let title, description, icon, color;
    
    if (activityType === "login") {
      const sessionMinutes = Math.floor(Math.random() * 120) + 15; // 15min - 2h
      title = "Customer Logged In";
      description = `${customer} • ${formatHours(sessionMinutes)} session`;
      icon = "🔐";
      color = "from-blue-500 to-blue-600";
    } else if (activityType === "estimate_confirmed") {
      const estimateNumber = Math.floor(Math.random() * 5000) + 1000;
      title = "Estimate Confirmed";
      description = `${customer} confirmed Estimate #${estimateNumber}`;
      icon = "✅";
      color = "from-green-500 to-green-600";
    } else if (activityType === "order_placed") {
      const amount = (Math.random() * 5000 + 500).toFixed(2);
      title = "Order Placed";
      description = `${customer} (${company}) • $${amount}`;
      icon = "🛒";
      color = "from-purple-500 to-purple-600";
    } else {
      title = "Portal Accessed";
      description = `${customer} accessed portal dashboard`;
      icon = "🌐";
      color = "from-cyan-500 to-cyan-600";
    }

    activities.push({
      id: `customer-${i + 1}`,
      type: activityType,
      title,
      description,
      icon,
      color,
      customer,
      company: activityType === "order_placed" ? company : null,
      relativeTime: getRandomTimeAgo(),
      createdAt: getRandomDate(),
    });
  }

  return activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Generate Recent Events
export function generateRecentEvents(count = 8) {
  const events = [];
  
  for (let i = 0; i < count; i++) {
    const eventType = getRandomItem([
      "ticket_opened",
      "job_status_changed",
      "new_order",
      "estimate_sent",
      "payment_received",
    ]);

    const customer = getRandomItem(customerNames);
    const company = getRandomItem(companyNames);
    const worker = getRandomItem(workerNames);

    let title, description, icon, color, priority;
    
    if (eventType === "ticket_opened") {
      const ticketNumber = Math.floor(Math.random() * 1000) + 100;
      title = "Support Ticket Opened";
      description = `Ticket #${ticketNumber} by ${customer}`;
      icon = "🎫";
      color = "from-orange-500 to-orange-600";
      priority = "high";
    } else if (eventType === "job_status_changed") {
      const jobNumber = Math.floor(Math.random() * 5000) + 1000;
      const statuses = ["Quote → Scheduled", "Scheduled → In Progress", "In Progress → Completed"];
      const statusChange = getRandomItem(statuses);
      title = "Job Status Changed";
      description = `Job #${jobNumber} • ${statusChange} by ${worker}`;
      icon = "🔄";
      color = "from-indigo-500 to-indigo-600";
      priority = "medium";
    } else if (eventType === "new_order") {
      const amount = (Math.random() * 5000 + 500).toFixed(2);
      title = "New Order";
      description = `${company} • $${amount}`;
      icon = "💰";
      color = "from-emerald-500 to-emerald-600";
      priority = "high";
    } else if (eventType === "estimate_sent") {
      const estimateNumber = Math.floor(Math.random() * 5000) + 1000;
      title = "Estimate Sent";
      description = `Estimate #${estimateNumber} sent to ${customer}`;
      icon = "📧";
      color = "from-teal-500 to-teal-600";
      priority = "low";
    } else {
      const amount = (Math.random() * 2000 + 100).toFixed(2);
      title = "Payment Received";
      description = `${customer} • $${amount}`;
      icon = "💳";
      color = "from-green-500 to-green-600";
      priority = "high";
    }

    events.push({
      id: `event-${i + 1}`,
      type: eventType,
      title,
      description,
      icon,
      color,
      priority,
      relativeTime: getRandomTimeAgo(),
      createdAt: getRandomDate(),
    });
  }

  return events.sort((a, b) => {
    // Sort by priority then time
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}
