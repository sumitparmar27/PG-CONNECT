// Platform takes this percentage of each booking's rent; the rest is owed to the owner.
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT) || 5;

function splitAmount(amount) {
  const platformFeeAmount = Math.round(amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  const ownerPayoutAmount = Math.round((amount - platformFeeAmount) * 100) / 100;
  return { platformFeeAmount, ownerPayoutAmount };
}

module.exports = { PLATFORM_FEE_PERCENT, splitAmount };
