import React, { useState, useEffect } from 'react';
import { adminPaymentConfigAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ImageUpload } from '../../../components/ui/image-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import toast from 'react-hot-toast';

export default function AdminPaymentSettings() {
    const [config, setConfig] = useState<any>({
        bankName: '',
        accountName: '',
        accountNumber: '',
        qrCodeUrl: '',
        isActive: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await adminPaymentConfigAPI.get();
            if (res.data.success) {
                setConfig(res.data.data || {
                    bankName: '',
                    accountName: '',
                    accountNumber: '',
                    qrCodeUrl: '',
                    isActive: true
                });
            }
        } catch (e) { toast.error('Failed to load settings'); }
        finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminPaymentConfigAPI.update(config);
            toast.success('Payment settings saved');
        } catch (e) { toast.error('Failed to save'); }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Payment Configuration</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Bank Transfer Settings</CardTitle>
                    <CardDescription>Configure the bank details shown to users during checkout.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input value={config.bankName} onChange={e => setConfig({ ...config, bankName: e.target.value })} placeholder="e.g. MB Bank" />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input value={config.accountNumber} onChange={e => setConfig({ ...config, accountNumber: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Account Owner Name</Label>
                            <Input value={config.accountName} onChange={e => setConfig({ ...config, accountName: e.target.value })} placeholder="e.g. NGUYEN VAN A" />
                        </div>
                        <div className="space-y-2">
                            <Label>QR Code Image</Label>
                            <ImageUpload
                                value={config.qrCodeUrl}
                                onChange={url => setConfig({ ...config, qrCodeUrl: url })}
                            />
                            <p className="text-sm text-gray-500">Upload your banking QR code for easier payments.</p>
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
