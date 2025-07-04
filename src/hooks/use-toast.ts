import toast from 'react-hot-toast';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const showToast = ({ title, description, variant = 'default' }: Toast) => {
    const message = description ? `${title}: ${description}` : title;
    
    if (variant === 'destructive') {
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }
      });
    } else {
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#f0fdf4',
          color: '#16a34a',
          border: '1px solid #bbf7d0'
        }
      });
    }
  };

  return { toast: showToast };
}; 