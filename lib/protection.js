const antiLinkGroups = new Set();

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

module.exports = {
  setAntiLink,
  isAntiLinkEnabled
};
