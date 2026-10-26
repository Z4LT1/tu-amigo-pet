import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/** Sugerencias del buscador (autocompletado). */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });

  const items = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ name: { contains: q } }, { brand: { name: { contains: q } } }, { category: { name: { contains: q } } }],
    },
    take: 6,
    orderBy: [{ isFeatured: "desc" }, { stock: "desc" }],
    select: {
      slug: true,
      name: true,
      price: true,
      presentation: true,
      packColor: true,
      brand: { select: { name: true } },
      category: { select: { icon: true, name: true } },
    },
  });

  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=60" } });
}
