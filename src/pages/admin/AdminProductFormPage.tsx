import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminApi, shopApi } from '../../services/shopApi';
import { ImageUpload } from '../../components/ui/image-upload';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { Product, ProductVariant } from '../../types/shop';
import { Plus, Trash2 } from 'lucide-react';

type ProductFormValues = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'purchaseCount'>> & {
  tagsText?: string;
};

const defaultValues: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  images: [],
  category: '',
  stock: 0,
  isActive: true,
  isFeatured: false,
  pointsReward: 0,
  pointsRequired: 0,
  canPurchaseWithPoints: false,
  variants: [],
  freeShipping: false,
  tags: [],
  tagsText: '',
};

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [values, setValues] = useState<ProductFormValues>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const canSubmit = useMemo(() => Boolean(values.name && values.description && values.category && values.price !== undefined), [values]);

  const update = (patch: Partial<ProductFormValues>) => setValues(v => ({ ...v, ...patch }));

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await shopApi.getProductCategories();
      if (res.success) setCategories(res.data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const token = localStorage.getItem('token') || '';
      const res = await adminApi.getProductById(token, id);
      if (res.success) {
        const p: Product = res.data;
        setValues({
          ...defaultValues,
          ...p,
          tagsText: (p.tags || []).join(', '),
        });
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    try {
      const payload: any = {
        ...values,
        tags: (values.tagsText || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      delete payload.tagsText;
      if (isEdit) {
        await adminApi.updateProduct(token, id as string, payload);
      } else {
        await adminApi.createProduct(token, payload);
      }
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => update({ images: [...(values.images || []), ''] });
  const setImageAt = (index: number, url: string) => {
    const arr = [...(values.images || [])];
    arr[index] = url;
    update({ images: arr });
  };
  const removeImageAt = (index: number) => update({ images: (values.images || []).filter((_, i) => i !== index) });

  const addVariant = () => update({ variants: [...(values.variants || []), { name: '', value: '', priceAdjustment: 0, stock: 0 } as ProductVariant] });
  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    const variants = [...(values.variants || [])];
    variants[index] = { ...variants[index], ...patch } as ProductVariant;
    update({ variants });
  };
  const removeVariant = (index: number) => update({ variants: (values.variants || []).filter((_, i) => i !== index) });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/products')}>{t('common.cancel') || 'Hủy'}</Button>
          <Button disabled={!canSubmit || loading} onClick={handleSubmit as any}>{loading ? 'Đang lưu...' : (t('common.save') || 'Lưu')}</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Điền tên, mô tả, giá và danh mục.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên sản phẩm</Label>
                <Input value={values.name || ''} onChange={(e) => update({ name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea value={values.description || ''} onChange={(e) => update({ description: e.target.value })} className="min-h-[120px]" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Giá</Label>
                  <Input type="number" min={0} value={values.price ?? 0} onChange={(e) => update({ price: Number(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Giá gốc</Label>
                  <Input type="number" min={0} value={values.originalPrice ?? ''} onChange={(e) => update({ originalPrice: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Tồn kho</Label>
                  <Input type="number" min={0} value={values.stock ?? 0} onChange={(e) => update({ stock: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select value={values.category || ''} onValueChange={(v) => update({ category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Thương hiệu</Label>
                  <Input value={values.brand || ''} onChange={(e) => update({ brand: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={values.sku || ''} onChange={(e) => update({ sku: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Điểm thưởng</Label>
                  <Input type="number" min={0} value={values.pointsReward ?? 0} onChange={(e) => update({ pointsReward: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Điểm cần</Label>
                  <Input type="number" min={0} value={values.pointsRequired ?? 0} onChange={(e) => update({ pointsRequired: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Tags (phân tách bằng dấu phẩy)</Label>
                  <Input value={values.tagsText || ''} onChange={(e) => update({ tagsText: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biến thể</CardTitle>
              <CardDescription>Thêm các biến thể như size, màu sắc...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" onClick={addVariant} className="inline-flex items-center gap-2"><Plus className="w-4 h-4" />Thêm biến thể</Button>
              </div>
              {(values.variants || []).length === 0 && (
                <div className="text-sm text-gray-500">Chưa có biến thể</div>
              )}
              <div className="space-y-3">
                {(values.variants || []).map((v, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border rounded-lg p-3">
                    <div className="space-y-1">
                      <Label>Tên</Label>
                      <Input value={v.name} onChange={(e) => updateVariant(i, { name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Giá trị</Label>
                      <Input value={v.value} onChange={(e) => updateVariant(i, { value: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Điều chỉnh giá</Label>
                      <Input type="number" value={v.priceAdjustment} onChange={(e) => updateVariant(i, { priceAdjustment: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Tồn kho</Label>
                      <Input type="number" min={0} value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} />
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" onClick={() => removeVariant(i)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Hiển thị</Label>
                <Switch checked={values.isActive || false} onCheckedChange={(v) => update({ isActive: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Nổi bật</Label>
                <Switch checked={values.isFeatured || false} onCheckedChange={(v) => update({ isFeatured: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Miễn phí vận chuyển</Label>
                <Switch checked={values.freeShipping || false} onCheckedChange={(v) => update({ freeShipping: v })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
              <CardDescription>Thêm nhiều hình ảnh cho sản phẩm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={addImage} className="inline-flex items-center gap-2"><Plus className="w-4 h-4" />Thêm hình</Button>
              </div>
              {(values.images || []).length === 0 && (
                <div className="text-sm text-gray-500">Chưa có hình ảnh. Nhấn "Thêm hình" để tải lên.</div>
              )}
              {(values.images || []).map((img, i) => (
                <div key={i} className="relative">
                  <ImageUpload value={img} onChange={(url) => setImageAt(i, url)} placeholder="Tải lên hình ảnh" />
                  <div className="flex justify-end mt-2">
                    <Button type="button" variant="outline" onClick={() => removeImageAt(i)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;


