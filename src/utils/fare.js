function estimateFare(distanceKm, durationMinutes) {
  const baseFare = Number(process.env.BASE_FARE || 40);
  const perKm = Number(process.env.PRICE_PER_KM || 12);
  const perMinute = Number(process.env.PRICE_PER_MINUTE || 1.5);
  const total = baseFare + (Number(distanceKm) * perKm) + (Number(durationMinutes) * perMinute);
  return Math.max(0, Math.round(total * 100) / 100);
}

module.exports = estimateFare;
