const antiLinkGroups = new Set();
const antiFloodGroups = new Set();

function setAntiLink(groupId, enabled) {
  if (enabled) {
    antiLinkGroups.add(groupId);
  } else {
    antiLinkGroups.delete(groupId);
  }
}

function isAntiLinkEnabled(groupId) {
  return antiLinkGroups.has(groupId);
}

function setAntiFlood(groupId, enabled) {
  if (enabled) {
    antiFloodGroups.add(groupId);
  } else {
    antiFloodGroups.delete(groupId);
  }
}

function isAntiFloodEnabled(groupId) {
  return antiFloodGroups.has(groupId);
}

module.exports = {
  setAntiLink,
  isAntiLinkEnabled,
  setAntiFlood,
  isAntiFloodEnabled
};
