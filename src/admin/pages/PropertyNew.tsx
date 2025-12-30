import { AdminLayout } from '../components/AdminLayout';
import { PropertyForm } from '../components/PropertyForm';

export const PropertyNew = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <PropertyForm />
      </div>
    </AdminLayout>
  );
};
