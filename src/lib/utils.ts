export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Available':
      return 'bg-green-500';
    case 'Under Contract':
      return 'bg-yellow-500';
    case 'Sold':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};
