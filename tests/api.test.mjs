import test from 'node:test';
import assert from 'node:assert/strict';

import { handleHealthCheck } from '../server/api/health.ts';
import { handleParentalConsent } from '../server/api/parentalConsent.ts';
import { handleGetProgress, handlePostProgress } from '../server/api/progress.ts';
import { handleGetBadges, handlePostBadge } from '../server/api/badges.ts';
import { handleGetRoster, handleEnrollCadet } from '../server/api/roster.ts';
import { detectPIIViolation } from '../server/middleware/coppaGuard.ts';

test('1. Health Check API returns nominal status', () => {
  const res = handleHealthCheck();
  assert.equal(res.status, 'ok');
  assert.equal(res.coppaProtectionActive, true);
  assert.equal(typeof res.uptimeSeconds, 'number');
});

test('2. COPPA Guard identifies and blocks forbidden PII fields', () => {
  const cleanPayload = { nickname: 'Cadet Leo', callsign: 'PULSAR-7', ageGroup: '8-10' };
  assert.equal(detectPIIViolation(cleanPayload), null);

  const dirtyPayload1 = { nickname: 'Leo', fullName: 'Leo Alexander Johnson' };
  assert.equal(detectPIIViolation(dirtyPayload1), 'fullName');

  const dirtyPayload2 = { nickname: 'Leo', phoneNumber: '555-123-4567' };
  assert.equal(detectPIIViolation(dirtyPayload2), 'phoneNumber');

  const dirtyPayload3 = { nickname: 'Leo', address: '123 Launchpad Way' };
  assert.equal(detectPIIViolation(dirtyPayload3), 'address');
});

test('3. Parental Consent API: Failure Paths', () => {
  // Missing body
  const resEmpty = handleParentalConsent(null);
  assert.equal(resEmpty.status, 400);

  // Invalid email
  const resBadEmail = handleParentalConsent({
    email: 'not-an-email',
    role: 'parent',
    coppaConfirmed: true,
    educationalConfirmed: true
  });
  assert.equal(resBadEmail.status, 400);

  // Missing COPPA checkbox
  const resNoCoppa = handleParentalConsent({
    email: 'parent@example.com',
    role: 'parent',
    coppaConfirmed: false,
    educationalConfirmed: true
  });
  assert.equal(resNoCoppa.status, 400);

  // PII injection attempt
  const resPii = handleParentalConsent({
    email: 'parent@example.com',
    role: 'parent',
    realName: 'John Doe',
    coppaConfirmed: true,
    educationalConfirmed: true
  });
  assert.equal(resPii.status, 400);
});

test('4. Parental Consent API: Happy Path', () => {
  const res = handleParentalConsent({
    email: 'test.parent@flight-school.edu',
    role: 'parent',
    coppaConfirmed: true,
    educationalConfirmed: true,
    studentId: 'cadet-nova-001'
  });
  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.verifiedEmail, 'test.parent@flight-school.edu');
});

test('5. Progress API: Validation & State Update', () => {
  // Missing profileId on GET
  const getFail = handleGetProgress('');
  assert.equal(getFail.status, 400);

  // Happy GET
  const getOk = handleGetProgress('cadet-nova-001');
  assert.equal(getOk.status, 200);
  assert.ok(getOk.data.progress['rocket-launch']);

  // Invalid missionId on POST
  const postBadMission = handlePostProgress({
    profileId: 'cadet-nova-001',
    missionId: 'warp-drive-jupiter',
    score: 85,
    status: 'complete'
  });
  assert.equal(postBadMission.status, 400);

  // Invalid score on POST
  const postBadScore = handlePostProgress({
    profileId: 'cadet-nova-001',
    missionId: 'rocket-launch',
    score: 150,
    status: 'complete'
  });
  assert.equal(postBadScore.status, 400);

  // Happy POST with unlock calculation
  const postOk = handlePostProgress({
    profileId: 'cadet-nova-001',
    missionId: 'rocket-launch',
    score: 92,
    status: 'complete'
  });
  assert.equal(postOk.status, 200);
  assert.equal(postOk.data.success, true);
  assert.equal(postOk.data.updatedMission.score, 92);
  assert.equal(postOk.data.updatedMission.status, 'complete');
});

test('6. Badges API: Certification Criteria & Anti-Tamper', () => {
  // Score under 70% must be rejected
  const failScore = handlePostBadge({
    profileId: 'cadet-nova-001',
    badgeId: 'rocket-engineer',
    missionId: 'rocket-launch',
    score: 65
  });
  assert.equal(failScore.status, 400);
  assert.equal(failScore.data.error, 'INSUFFICIENT_SCORE');

  // Mismatched mission
  const failMismatch = handlePostBadge({
    profileId: 'cadet-nova-001',
    badgeId: 'rocket-engineer',
    missionId: 'mars-rover-code',
    score: 95
  });
  assert.equal(failMismatch.status, 400);
  assert.equal(failMismatch.data.error, 'MISSION_MISMATCH');

  // Happy Award
  const awardOk = handlePostBadge({
    profileId: 'cadet-nova-001',
    badgeId: 'station-commander',
    missionId: 'space-station',
    score: 90
  });
  assert.ok(awardOk.status === 201 || awardOk.status === 200);
  assert.equal(awardOk.data.success, true);
});

test('7. Roster API: Class Metrics & Enrollment', () => {
  // Enroll new cadet
  const enroll = handleEnrollCadet({
    id: 'cadet-test-99',
    nickname: 'Cadet Orion',
    callsign: 'STAR-SEEKER',
    avatar: '👨‍🚀',
    classCode: 'NASA-CADET-5A'
  });
  assert.equal(enroll.status, 200);
  assert.equal(enroll.data.student.nickname, 'Cadet Orion');

  // Fetch roster
  const roster = handleGetRoster('NASA-CADET-5A');
  assert.equal(roster.status, 200);
  assert.ok(roster.data.students.length >= 1);
  assert.equal(typeof roster.data.metrics.classAvgScore, 'number');
  assert.equal(typeof roster.data.metrics.masteryRate, 'number');
});
