import type { CSSProperties } from "react"

import { CheckCircleMiniSolid } from "@medusajs/icons"
import Github from "@modules/common/icons/github"
import { Button } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

type HeroFeature = {
  label: string
  description: string
  badge?: string
}

const newBadgeStyle: CSSProperties = {
  background:
    "linear-gradient(168deg, #DEBA92 30%, #9F724E 60%, #7A482E 80%)",
  borderColor: "rgba(191, 140, 97)",
  borderWidth: "0.5px",
}

const Hero = async () => {
  const t = await getTranslations("Hero")
  const features = t.raw("features") as HeroFeature[]

  return (
    <div className="w-full border-b border-ui-border-base bg-ui-bg-subtle">
      <div className="content-container lg:max-w-7xl grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-0 py-16 lg:py-64">
        <div className="flex flex-col items-start gap-4">
          <span className="txt-xl text-ui-fg-muted">{t("eyebrow")}</span>
          <h1 className="text-4xl lg:text-5xl text-ui-fg-base">
            {t("title")}
          </h1>
          <span className="txt-xl-plus text-ui-fg-subtle">
            {t("subtitle")}
          </span>
          <a
            href="https://github.com/gorgojs/medusa-dtc-starter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              className="!rounded-full txt-compact-large-plus"
            >
              {t("viewOnGitHub")} <Github className="rounded-full" />
            </Button>
          </a>
        </div>

        <div className="lg:border-l lg:border-ui-border-base lg:pl-20">
          <span className="txt-xl uppercase text-ui-fg-muted">
            {t("featuresHeading")}
          </span>
          <ul className="mt-5 flex flex-col gap-4">
            {features.map((feature) => (
              <li
                key={feature.label}
                className="flex items-start gap-3 txt-compact-medium text-ui-fg-subtle"
              >
                <CheckCircleMiniSolid className="mt-0.5 shrink-0 text-ui-fg-base" />
                <span>
                  <span className="font-medium text-ui-fg-base">
                    {feature.label}
                  </span>
                  {feature.badge && (
                    <span
                      className="ml-2 items-center rounded-full border px-2 py-0.5 text-[12px] uppercase leading-none text-white"
                      style={newBadgeStyle}
                    >
                      {feature.badge}
                    </span>
                  )}
                  <span className="text-ui-fg-subtle">
                    {" "} — {feature.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Hero
