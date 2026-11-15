import { useNavigate } from '@tanstack/react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemoSession, demoHome, type DemoRole } from '@/lib/journey/demo-session';
import { VOLUNTEERS } from '@/lib/journey/operations';
import { useJourney } from '@/lib/journey/store';
import { cn } from '@/lib/utils';

export function DemoAccount() {
 const session=useDemoSession();
 const navigate=useNavigate();
 const role=session?.role;
 const {views,setCity}=useJourney();
 return <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
  <Select value={role ?? 'admin'} onValueChange={(value)=>{session?.signIn(value as DemoRole);setCity('all');void navigate({to:demoHome(value as DemoRole)});}}><SelectTrigger aria-label="Switch view" className="w-40"><span className="mr-1 text-xs text-muted-foreground">Switch view</span><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="volunteer">Volunteer</SelectItem><SelectItem value="participant">Participant</SelectItem></SelectContent></Select>
  <span className={cn('rounded-md px-2 py-1 text-xs font-semibold',role==='participant'?'bg-sun-orange text-primary':role==='volunteer'?'bg-purple text-primary-foreground':'bg-primary text-primary-foreground')}>{role==='participant'?'Participant view':role==='volunteer'?'Volunteer view':'Admin view'}</span>
  {role==='volunteer' && <label className="flex items-center gap-2 text-xs text-muted-foreground">Volunteer<Select value={session?.volunteerId} onValueChange={(id)=>{session?.selectVolunteer(id);setCity('all');}}><SelectTrigger aria-label="Volunteer" className="w-44"><SelectValue/></SelectTrigger><SelectContent>{VOLUNTEERS.map(v=><SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></label>}
  {role==='participant' && <label className="flex items-center gap-2 text-xs text-muted-foreground">Participant<Select value={session?.participantId} onValueChange={id=>session?.selectParticipant(id)}><SelectTrigger aria-label="Participant" className="w-44"><SelectValue/></SelectTrigger><SelectContent>{views.map(v=><SelectItem key={v.participant.id} value={v.participant.id}>{v.participant.firstName} {v.participant.lastName}</SelectItem>)}</SelectContent></Select></label>}
 </div>;
}