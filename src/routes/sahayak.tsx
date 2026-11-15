import { createFileRoute, redirect } from '@tanstack/react-router';
export const Route = createFileRoute('/sahayak')({
  beforeLoad: () => { throw redirect({ to: '/settings', search: { tab: 'sahayak' }, replace: true }); },
  head: () => ({ meta: [
    { title: 'Sahayak preferences · Journey' },
    { name: 'description', content: 'Manage Sahayak in Journey Settings.' },
    { property: 'og:title', content: 'Sahayak preferences · Journey' },
    { property: 'og:description', content: 'Manage Sahayak in Journey Settings.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
});
