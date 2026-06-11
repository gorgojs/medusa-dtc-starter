import { revalidatePath, revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret")

  if (
    process.env.REVALIDATE_SECRET &&
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  if (
    body.type === "product.updated" ||
    body.type === "product.created" ||
    body.type === "product.deleted"
  ) {
    revalidateTag("products")
    revalidatePath(`/[countryCode]/(main)/products/[handle]`, "page")
    revalidatePath(`/[countryCode]/(main)/store`, "page")
    revalidatePath(`/[countryCode]/(main)/categories/[...category]`, "page")
    revalidatePath(`/[countryCode]/(main)/collections/[handle]`, "page")
  }

  if (
    body.type === "product-category.updated" ||
    body.type === "product-category.created" ||
    body.type === "product-category.deleted"
  ) {
    revalidateTag("categories")
    revalidatePath(`/[countryCode]/(main)/products/[handle]`, "page")
    revalidatePath(`/[countryCode]/(main)/store`, "page")
    revalidatePath(`/[countryCode]/(main)/categories/[...category]`, "page")
    revalidatePath(`/[countryCode]/(main)/collections/[handle]`, "page")
  }

  if (
    body.type === "product-collection.updated" ||
    body.type === "product-collection.created" ||
    body.type === "product-collection.deleted"
  ) {
    revalidateTag("collections")
    revalidatePath(`/[countryCode]/(main)/collections/[handle]`, "page")
    revalidatePath(`/[countryCode]/(main)/store`, "page")
  }

  return NextResponse.json({ revalidated: true })
}
