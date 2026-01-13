import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import CompanyDetailModal from "./CompanyDetailModal";

export default function CompaniesSection({ companies, loading }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle>ServiceM8 Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          ServiceM8 Companies
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {companies.length} total companies
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {companies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No companies found
            </div>
          ) : (
            companies.map((company) => (
              <div
                key={company.uuid}
                onClick={() => handleCompanyClick(company)}
                className="p-4 rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-sm transition-all duration-300 cursor-pointer hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {company.name}
                      </h3>
                      {company.activeJobs > 0 && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {company.activeJobs} active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {company.contactName}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="opacity-60">📧</span>
                    <span className="text-muted-foreground truncate">{company.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-60">📞</span>
                    <span className="text-muted-foreground">{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-60">📍</span>
                    <span className="text-muted-foreground truncate">
                      {company.address}, {company.city} {company.postcode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <span className="opacity-60">📋</span>
                    <span className="text-muted-foreground">
                      {company.totalJobs} total jobs
                    </span>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-muted-foreground text-xs">
                      Last job: {new Date(company.lastJobDate).toLocaleDateString("en-AU", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CompanyDetailModal
        company={selectedCompany}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
      />
    </Card>
  );
}

