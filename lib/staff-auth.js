function readBearer(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  return String(header).replace(/^Bearer\s+/i, '').trim();
}

function expectedStaffToken() {
  return String(process.env.STAFF_INBOX_TOKEN || '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

function staffAuthorized(req) {
  const expected = expectedStaffToken();
  if (!expected) return false;
  return readBearer(req) === expected;
}

module.exports = { readBearer, expectedStaffToken, staffAuthorized };
