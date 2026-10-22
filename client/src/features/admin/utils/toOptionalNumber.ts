export const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === "" || value === null || value === undefined) return undefined;

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
