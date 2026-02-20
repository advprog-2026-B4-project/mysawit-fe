import HealthCheck from '@/modules/healthcheck/HealthCheck';

export const metadata = {
  title: 'Health Status | MySawit',
  description: 'System health and service status',
};

export default function HealthPage() {
  return <HealthCheck />;
}
