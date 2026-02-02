import { useState } from "react";
import { PaymentSection } from "../sections/PaymentSection";
import { DocumentSection } from "../sections/DocumentSection";
import { TaskSection } from "../sections/TaskSection";
import { mockPaymentHistory, mockDocumentList, mockTaskList } from "../../../lib/mocks/portal";

export function PaymentsView({ view }) {
  const [taskState, setTaskState] = useState({});
  
  // Use actual data if available, otherwise use mock data
  const payments = view?.payments || mockPaymentHistory();
  const documents = view?.documents || mockDocumentList();
  const tasks = view?.tasks || mockTaskList();

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-border-subtle bg-background p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Financial overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Payments & Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your balance, view payment history, and access all important documents.
        </p>
      </div>

      <PaymentSection payments={payments} />
      <DocumentSection documents={documents} />
      <TaskSection tasks={tasks} taskState={taskState} setTaskState={setTaskState} />
    </div>
  );
}

