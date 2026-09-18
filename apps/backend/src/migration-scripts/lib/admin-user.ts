import type { MedusaContainer } from "@medusajs/framework";
import { logger } from "@medusajs/framework/logger";
import { Modules } from "@medusajs/framework/utils";
import { createUsersWorkflow } from "@medusajs/medusa/core-flows";
import { SEED_STORE } from "../data/store";
import { getQuery } from "./utils";

const AUTH_PROVIDER = "emailpass";

const getUserByEmail = async (container: MedusaContainer, email: string) => {
  const { data } = await getQuery(container).graph({
    entity: "user",
    fields: ["id"],
    filters: { email },
  });
  return data[0];
};

export const seedAdminUser = async (container: MedusaContainer) => {
  const { email, password } = SEED_STORE.admin;

  if (await getUserByEmail(container, email)) {
    logger.info(`Admin user ${email} already exists — skipping.`);
    return;
  }

  const authModuleService = container.resolve(Modules.AUTH);

  const [existingIdentity] = await authModuleService.listAuthIdentities({
    provider_identities: { entity_id: email, provider: AUTH_PROVIDER },
  });

  let authIdentityId = existingIdentity?.id;

  if (!authIdentityId) {
    const { authIdentity, error } = await authModuleService.register(
      AUTH_PROVIDER,
      { body: { email, password } },
    );

    if (error || !authIdentity) {
      throw new Error(`Could not register the admin identity: ${error}`);
    }

    authIdentityId = authIdentity.id;
  }

  const {
    result: [user],
  } = await createUsersWorkflow(container).run({
    input: { users: [{ email }] },
  });

  await authModuleService.updateAuthIdentities({
    id: authIdentityId,
    app_metadata: { user_id: user.id },
  });
};
