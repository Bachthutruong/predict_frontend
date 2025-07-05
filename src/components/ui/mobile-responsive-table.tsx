import React from 'react';

interface MobileResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileResponsiveTable: React.FC<MobileResponsiveTableProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`w-full overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="min-w-full inline-block align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    </div>
  );
};

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
}

export const ResponsiveTableHeader: React.FC<ResponsiveTableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {children}
      </tr>
    </thead>
  );
};

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
}

export const ResponsiveTableBody: React.FC<ResponsiveTableBodyProps> = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  );
};

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTableRow: React.FC<ResponsiveTableRowProps> = ({ children, className = '' }) => {
  return (
    <tr className={`hover:bg-gray-50 ${className}`}>
      {children}
    </tr>
  );
};

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

export const ResponsiveTableCell: React.FC<ResponsiveTableCellProps> = ({ 
  children, 
  className = '', 
  minWidth 
}) => {
  const baseClasses = 'px-2 sm:px-4 py-3 whitespace-nowrap';
  const minWidthClass = minWidth ? `min-w-[${minWidth}]` : '';
  
  return (
    <td className={`${baseClasses} ${minWidthClass} ${className}`}>
      {children}
    </td>
  );
};

interface ResponsiveTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

export const ResponsiveTableHeaderCell: React.FC<ResponsiveTableHeaderCellProps> = ({ 
  children, 
  className = '', 
  minWidth 
}) => {
  const baseClasses = 'px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
  const minWidthClass = minWidth ? `min-w-[${minWidth}]` : '';
  
  return (
    <th className={`${baseClasses} ${minWidthClass} ${className}`}>
      {children}
    </th>
  );
}; 