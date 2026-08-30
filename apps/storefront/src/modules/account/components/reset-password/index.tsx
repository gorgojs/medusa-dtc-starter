"use client"

import { resetPassword } from "@lib/data/customer"
import { Link } from "@i18n/navigation"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import { useTranslations } from "next-intl"

type Props = {
  token: string
  email?: string
}

const ResetPassword = ({ token, email }: Props) => {
  const t = useTranslations("ResetPassword")
  const [state, formAction] = useActionState(resetPassword, {
    success: false,
    error: null,
  })

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="reset-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">{t("heading")}</h1>

      {state.success ? (
        <>
          <p
            className="text-center text-base-regular text-ui-fg-base mb-8"
            data-testid="reset-password-done"
          >
            {t("done")}
          </p>
          <Link
            href="/account"
            className="underline text-small-regular"
            data-testid="go-to-sign-in-link"
          >
            {t("goToSignIn")}
          </Link>
        </>
      ) : !token ? (
        <>
          <p className="text-center text-base-regular text-ui-fg-base mb-8">
            {t("missingToken")}
          </p>
          <Link
            href="/account"
            className="underline text-small-regular"
            data-testid="go-to-sign-in-link"
          >
            {t("goToSignIn")}
          </Link>
        </>
      ) : (
        <>
          <p className="text-center text-base-regular text-ui-fg-base mb-8">
            {email ? t("descriptionWithEmail", { email }) : t("description")}
          </p>
          <form className="w-full" action={formAction}>
            <input type="hidden" name="token" value={token} />
            <div className="flex flex-col w-full gap-y-2">
              <Input
                label={t("password")}
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                data-testid="password-input"
              />
              <Input
                label={t("confirmPassword")}
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                data-testid="confirm-password-input"
              />
            </div>
            {/* Rendered directly rather than through `ErrorMessage`, which maps
                whatever it is given back through the generic error table and
                would flatten these page-specific messages into "something went
                wrong". */}
            {state.error ? (
              <div
                className="pt-2 text-rose-500 text-small-regular"
                data-testid="reset-password-error-message"
              >
                <span>{t(state.error)}</span>
              </div>
            ) : null}
            <SubmitButton
              size="large"
              data-testid="reset-password-button"
              className="w-full mt-6"
            >
              {t("submit")}
            </SubmitButton>
          </form>
        </>
      )}
    </div>
  )
}

export default ResetPassword
