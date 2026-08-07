import { Package, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatWon } from '@/lib/storeApi'
import { cn } from '@/lib/utils'
import type { Product, ProductType } from '@/types/store'

type CategoryFilter = 'all' | '소모품' | '미술용품' | '맞춤 굿즈'

interface StoreCatalogProps {
  products: Product[]
  loading: boolean
  error: string | null
  filter: CategoryFilter
  onFilterChange: (filter: CategoryFilter) => void
  cartCount: number
  onOpenCart: () => void
  onAddToCart: (product: Product) => void
}

const filters: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: '소모품', label: '소모품' },
  { id: '미술용품', label: '미술용품' },
  { id: '맞춤 굿즈', label: '맞춤 굿즈' },
]

function ProductIcon({ type }: { type: ProductType }) {
  if (type === 'custom') {
    return <Sparkles className="h-8 w-8 text-primary" />
  }
  return <Package className="h-8 w-8 text-primary" />
}

export function StoreCatalog({
  products,
  loading,
  error,
  filter,
  onFilterChange,
  cartCount,
  onOpenCart,
  onAddToCart,
}: StoreCatalogProps) {
  const filtered =
    filter === 'all' ? products : products.filter((p) => p.category === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">스토어</h1>
          <p className="mt-1 text-muted-foreground">
            수업 준비물 · 맞춤 굿즈 (행정실 후불 정산 · 카드 결제 없음)
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-2xl" onClick={onOpenCart}>
          <ShoppingBag className="h-4 w-4" />
          장바구니 ({cartCount})
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filter === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">상품을 불러오는 중...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            표시할 상품이 없습니다. Supabase에 스토어 마이그레이션(004)을 적용했는지
            확인해 주세요.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <Card key={product.id} className="border-0 shadow-sm">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div className="flex h-28 items-center justify-center rounded-2xl bg-sidebar-active">
                <ProductIcon type={product.type} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {product.category}
                  </span>
                  {product.type === 'custom' ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      맞춤
                    </span>
                  ) : null}
                </div>
                <p className="font-semibold text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <p className="pt-1 text-lg font-bold text-foreground">
                  {formatWon(product.unit_price)}
                </p>
                {product.type === 'custom' ? (
                  <p className="text-xs text-muted-foreground">
                    사진 업로드 · 시안 확인 후 장바구니에 담을 수 있습니다.
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                className="w-full rounded-xl"
                onClick={() => onAddToCart(product)}
              >
                {product.type === 'custom' ? '시안 설정 후 담기' : '장바구니 담기'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
