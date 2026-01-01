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
    case 'pending':
      return 'bg-blue-500';
    case 'Available':
      return 'bg-green-500';
    case 'Under Contract':
      return 'bg-yellow-500';
    case 'Sold':
      return 'bg-gray-600';
    default:
      return 'bg-gray-500';
  }
};

export const getPublicStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Coming Soon';
    case 'Available':
      return 'Available';
    case 'Under Contract':
      return 'Under Contract';
    case 'Sold':
      return 'Sold';
    default:
      return status;
  }
};

export const getAdminStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'Available':
      return 'Active';
    case 'Under Contract':
      return 'Under Contract';
    case 'Sold':
      return 'Sold';
    default:
      return status;
  }
};
