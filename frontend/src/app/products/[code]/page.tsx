import { ProductDetail } from "@/components/product/ProductDetail";

interface ProductPageProps {
  params: Promise<{ code: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { code } = await params;
  return <ProductDetail code={code} />;
}
