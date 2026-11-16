import { createFileRoute } from '@tanstack/react-router';
import { DemoLogin } from '@/components/journey/DemoLogin';
export const Route=createFileRoute('/demo-login')({head:()=>({meta:[{title:'Demo sign-in · Sahayak'},{name:'description',content:'Choose Participant, Volunteer or Admin. No password needed.'},{property:'og:title',content:'Demo sign-in · Sahayak'},{property:'og:description',content:'Three separate demo views for your journey, follow-ups and centre.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:DemoLogin});
