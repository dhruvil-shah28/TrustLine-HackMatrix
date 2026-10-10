-- CreateTable
CREATE TABLE "IngestedEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "arrivalTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "isLateArrival" BOOLEAN NOT NULL DEFAULT false,
    "caseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseRevision" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "triggerEventId" TEXT,
    "previousPriority" TEXT NOT NULL,
    "newPriority" TEXT NOT NULL,
    "addedEvidenceJson" TEXT NOT NULL,
    "snapshotSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngestedEvent_eventId_key" ON "IngestedEvent"("eventId");

-- CreateIndex
CREATE INDEX "CaseRevision_caseId_revisionNumber_idx" ON "CaseRevision"("caseId", "revisionNumber");

-- AddForeignKey
ALTER TABLE "CaseRevision" ADD CONSTRAINT "CaseRevision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
