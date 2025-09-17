import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Product, ProductVariant } from '../../types/shop';
import { ImageUpload } from '../ui/image-upload';

type ProductFormValues = Partial<Omit<Product,
  'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'purchaseCount'
>> & {
  tagsText?: string;
};

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  initialValues?: Product | null;
}

const defaultValues: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  originalPrice: undefined,
  images: [],
  category: '',
  brand: '',
  sku: '',
  stock: 0,
  isActive: true,
  isFeatured: false,
  weight: 0,
  dimensions: { length: 0, width: 0, height: 0 },
  pointsReward: 0,
  pointsRequired: 0,
  canPurchaseWithPoints: false,
  tags: [],
  variants: [],
  freeShipping: false,
  shippingWeight: 0,
  tagsText: '',
};

export default function ProductFormModal({ open, onClose, onSubmit, initialValues }: ProductFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<ProductFormValues>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        ...defaultValues,
        ...initialValues,
        tagsText: (initialValues.tags || []).join(', '),
      });
    } else {
      setValues(defaultValues);
    }
  }, [initialValues, open]);

  const canSubmit = useMemo(() => {
    return Boolean(values.name && values.description && values.category && values.price !== undefined);
  }, [values]);

  const update = (patch: Partial<ProductFormValues>) => setValues(v => ({ ...v, ...patch }));

  const setImageAt = (index: number, url: string) => {
    const arr = [...(values.images || [])];
    arr[index] = url;
    update({ images: arr });
  };

  const addImage = () => update({ images: [...(values.images || []), ''] });
  const removeImageAt = (index: number) => update({ images: (values.images || []).filter((_, i) => i !== index) });

  const addVariant = () => {
    const variants = [...(values.variants || [])];
    variants.push({ name: '', value: '', priceAdjustment: 0, stock: 0 } as ProductVariant);
    update({ variants });
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    const variants = [...(values.variants || [])];
    variants[index] = { ...variants[index], ...patch } as ProductVariant;
    update({ variants });
  };

  const removeVariant = (index: number) => update({ variants: (values.variants || []).filter((_, i) => i !== index) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload: ProductFormValues = {
        ...values,
        tags: (values.tagsText || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };
      delete (payload as any).tagsText;
      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-semibold">
            {initialValues ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                <input value={values.name || ''} onChange={e => update({ name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea value={values.description || ''} onChange={e => update({ description: e.target.value })} className="w-full px-3 py-2 border rounded-lg min-h-[120px]" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Giá</label>
                  <input type="number" min={0} value={values.price ?? 0} onChange={e => update({ price: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá gốc</label>
                  <input type="number" min={0} value={values.originalPrice ?? ''} onChange={e => update({ originalPrice: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tồn kho</label>
                  <input type="number" min={0} value={values.stock ?? 0} onChange={e => update({ stock: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục</label>
                  <input value={values.category || ''} onChange={e => update({ category: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                  <input value={values.brand || ''} onChange={e => update({ brand: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input value={values.sku || ''} onChange={e => update({ sku: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Điểm thưởng</label>
                  <input type="number" min={0} value={values.pointsReward ?? 0} onChange={e => update({ pointsReward: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Điểm cần</label>
                  <input type="number" min={0} value={values.pointsRequired ?? 0} onChange={e => update({ pointsRequired: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={values.canPurchaseWithPoints || false} onChange={e => update({ canPurchaseWithPoints: e.target.checked })} />
                    Mua bằng điểm
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (phân tách bằng dấu phẩy)</label>
                <input value={values.tagsText || ''} onChange={e => update({ tagsText: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              {/* Variants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Biến thể</label>
                  <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Thêm biến thể
                  </button>
                </div>
                {(values.variants || []).length === 0 && (
                  <div className="text-sm text-gray-500">Chưa có biến thể</div>
                )}
                <div className="space-y-3">
                  {(values.variants || []).map((v, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border p-3 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium mb-1">Tên</label>
                        <input value={v.name} onChange={e => updateVariant(i, { name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Giá trị</label>
                        <input value={v.value} onChange={e => updateVariant(i, { value: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Điều chỉnh giá</label>
                        <input type="number" value={v.priceAdjustment} onChange={e => updateVariant(i, { priceAdjustment: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tồn kho</label>
                        <input type="number" min={0} value={v.stock} onChange={e => updateVariant(i, { stock: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => removeVariant(i)} className="px-3 py-2 rounded-lg border text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Images and switches */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={values.isActive || false} onChange={e => update({ isActive: e.target.checked })} />
                  Hiển thị
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={values.isFeatured || false} onChange={e => update({ isFeatured: e.target.checked })} />
                  Nổi bật
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={values.freeShipping || false} onChange={e => update({ freeShipping: e.target.checked })} />
                  Miễn phí vận chuyển
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Hình ảnh</label>
                  <button type="button" onClick={addImage} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-black">
                    <Plus className="w-4 h-4" /> Thêm hình
                  </button>
                </div>
                <div className="space-y-3">
                  {(values.images || []).map((img, i) => (
                    <div key={i} className="relative">
                      <ImageUpload value={img} onChange={(url) => setImageAt(i, url)} placeholder="Tải lên hình ảnh" />
                      <button type="button" onClick={() => removeImageAt(i)} className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-white/90 hover:bg-white border">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                  {(values.images || []).length === 0 && (
                    <div className="text-sm text-gray-500">Chưa có hình ảnh. Nhấn "Thêm hình" để tải lên.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Hủy</button>
            <button type="submit" disabled={!canSubmit || submitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60">
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


