import { Github, CheckCircleMiniSolid } from "@medusajs/icons";
import { Button } from "@modules/common/components/ui";
import { getTranslations } from "next-intl/server";

const Hero = async () => {
  const t = await getTranslations("Hero");
  const features = t.raw("features") as string[];

  return (
    <div className="w-full border-b border-ui-border-base bg-ui-bg-subtle">
      <div className="content-container lg:max-w-6xl grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-0 py-16 lg:py-64">
        <div className="flex flex-col items-start gap-3">
          <span className="txt-xl">
            {t("subtitle")}
          </span>
          <h1 className="text-4xl lg:text-5xl text-ui-fg-base">
            {t("title")}
          </h1>
          <a
            href="https://github.com/gorgojs/medusa-dtc-starter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="!rounded-full mt-3">
              {t("viewOnGitHub")} <Github className="rounded-full"/>
            </Button>
          </a>
        </div>

        <div className="lg:border-l lg:border-ui-border-base lg:pl-10">
          <span className="txt-compact-small-plus uppercase tracking-wider text-ui-fg-muted">
            {t("featuresHeading")}
          </span>
          <ul className="mt-5 flex flex-col gap-4">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 txt-compact-medium text-ui-fg-subtle"
              >
                <CheckCircleMiniSolid className="mt-0.5 shrink-0 text-ui-fg-base" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Hero;
