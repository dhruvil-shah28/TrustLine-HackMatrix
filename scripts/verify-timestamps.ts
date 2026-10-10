import { formatIST, parseTimestampDetails, compareTimestamps } from '../src/lib/date-utils';
import { prisma } from '../src/lib/prisma';
import { ingestIncrementalEvent } from '../src/lib/attack-dna';

async function runTimestampVerification() {
  console.log('====================================================');
  console.log('TRUSTLINE TIMESTAMP & TIMELINE ACCURACY VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`[PASS] ${label}`);
      passed++;
    } else {
      console.error(`[FAIL] ${label}`);
      failed++;
    }
  }

  // Test 1: Centralized IST Formatting
  const sampleIso = '2026-10-10T20:26:41.000Z';
  const formatted = formatIST(sampleIso);
  console.log(`Sample ISO: ${sampleIso} -> Formatted IST: "${formatted}"`);
  assert(formatted.includes('IST'), 'Formatted string contains explicit "IST" suffix');
  assert(formatted.includes('2026'), 'Formatted string includes full year 2026');
  assert(formatted.includes('Oct'), 'Formatted string includes abbreviated month Oct');

  // Test 2: Parse Details
  const details = parseTimestampDetails(sampleIso);
  assert(details.isValid === true, 'parseTimestampDetails correctly validates ISO string');
  assert(details.timeStr.includes('IST'), 'timeStr in parseTimestampDetails includes IST');

  // Test 3: Missing/Invalid Timestamp Handling
  const nullFormatted = formatIST(null);
  assert(nullFormatted === 'N/A', 'Null timestamp returns "N/A" without throw');

  const invalidFormatted = formatIST('invalid-date-string');
  assert(invalidFormatted === 'Invalid Date', 'Invalid date string returns "Invalid Date" without throw');

  // Test 4: Verify DB Records IST Formatting
  const tx = await prisma.transaction.findFirst({
    orderBy: { timestamp: 'desc' },
  });
  if (tx) {
    const txFormatted = formatIST(tx.timestamp);
    console.log(`Latest Tx (${tx.txHash}) Stored UTC: ${tx.timestamp.toISOString()} -> Display IST: "${txFormatted}"`);
    assert(txFormatted.includes('IST'), 'Transaction stored instant correctly formats to IST');
  }

  // Test 5: Verify Access Event Timestamps
  const access = await prisma.accessEvent.findFirst({
    orderBy: { timestamp: 'desc' },
  });
  if (access) {
    const accessFormatted = formatIST(access.timestamp);
    console.log(`Latest Access Event (${access.id}) Stored UTC: ${access.timestamp.toISOString()} -> Display IST: "${accessFormatted}"`);
    assert(accessFormatted.includes('IST'), 'Access event stored instant correctly formats to IST');
  }

  // Test 6: Ingested Event & Late Arrival Distinction
  const testEventId = `VERIFY-EVT-${Date.now()}`;
  const eventTimeStr = '2026-10-10T10:00:00.000Z';
  const arrivalTimeStr = '2026-10-10T10:15:00.000Z';

  const result1 = await ingestIncrementalEvent({
    eventId: testEventId,
    eventType: 'ACCESS_EVENT',
    eventTimestamp: eventTimeStr,
    arrivalTimestamp: arrivalTimeStr,
    entityType: 'EMPLOYEE',
    entityId: 'EMP-1001',
    payload: { action: 'VERIFICATION_TEST' },
  });

  assert(result1.status === 'PROCESSED', 'New incremental event ingested with status PROCESSED');
  assert(result1.isLateArrival === true, 'Late arrival gap (>15m) correctly detected and flagged');

  // Test 7: Idempotent Duplicate Delivery Prevention
  const result2 = await ingestIncrementalEvent({
    eventId: testEventId,
    eventType: 'ACCESS_EVENT',
    eventTimestamp: eventTimeStr,
    arrivalTimestamp: new Date().toISOString(),
    entityType: 'EMPLOYEE',
    entityId: 'EMP-1001',
    payload: { action: 'VERIFICATION_TEST' },
  });

  assert(result2.status === 'DUPLICATE_IGNORED', 'Duplicate delivery of same eventId is safely ignored');
  assert(result2.isDuplicate === true, 'isDuplicate flag set to true');

  // Clean up test event
  await prisma.ingestedEvent.deleteMany({ where: { eventId: testEventId } });

  console.log('\n====================================================');
  console.log(`TIMESTAMP VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTimestampVerification()
  .catch((err) => {
    console.error('Verification failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
