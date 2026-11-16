import { createFileRoute } from '@tanstack/react-router';
import { useDemoParticipant } from '@/components/participant/DemoParticipantContext';
import { UpcomingEventsCard } from './index';

export const Route=createFileRoute('/me/sessions')({
 head:()=>({meta:[{title:'Upcoming sessions · Sahayak'},{name:'description',content:'Upcoming sessions and official calendar links for your own journey.'},{property:'og:title',content:'Upcoming sessions · Sahayak'},{property:'og:description',content:'Explore sessions that fit your own journey and location.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:Sessions,
});
function Sessions(){const {data}=useDemoParticipant();return <div className="space-y-5"><h1 className="font-display text-[32px] font-normal text-primary">Upcoming Sessions</h1><UpcomingEventsCard events={data.upcoming} location={data.participant.city}/></div>;}