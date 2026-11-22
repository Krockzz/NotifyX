export function getEventEntityId(routingKey, applicationId) {
  if (typeof routingKey !== "string" || applicationId == null) return "—";

  const normalizedApplicationId = String(applicationId).trim();
  const normalizedRoutingKey = routingKey.trim();
  if (!normalizedApplicationId || !normalizedRoutingKey) return "—";

  const applicationPrefix = `${normalizedApplicationId}#`;
  if (!normalizedRoutingKey.startsWith(applicationPrefix)) return "—";

  const entityId = normalizedRoutingKey.slice(applicationPrefix.length).trim();
  return entityId || "—";
}
