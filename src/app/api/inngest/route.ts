import { serve } from "inngest/next";
import { inngest } from "../../../server/inngest/client";
import { mockPricingEngineJob, weeklySettlementJob } from "../../../server/inngest/functions";

// Expose the Inngest API
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    mockPricingEngineJob,
    weeklySettlementJob,
  ],
});
