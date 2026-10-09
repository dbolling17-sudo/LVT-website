// Sanity webhook: when an editor publishes an event or special, refresh the cached pages.
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "Revalidation secret not set" }, { status: 500 });
  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);
  if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  if (body?._type !== "event" && body?._type !== "special") {
    return NextResponse.json({ message: "Ignored", type: body?._type ?? null }, { status: 400 });
  }
  revalidateTag(body._type, { expire: 0 });
  return NextResponse.json({ revalidated: body._type });
}
