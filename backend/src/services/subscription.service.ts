import { hasPremiumAccess } from "../utils/subscription";
import { getDemoUser } from "./user.service";

export async function getSubscriptionStatus() {
  const user = await getDemoUser();

  return {
    status: user.subscriptionStatus,
    hasAccess: hasPremiumAccess(user.subscriptionStatus),
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd
      ? user.subscriptionCurrentPeriodEnd.toISOString()
      : null,
  };
}
