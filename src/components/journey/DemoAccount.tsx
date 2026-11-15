import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useDemoSession } from '@/lib/journey/demo-session';
import { cn } from '@/lib/utils';

export function DemoAccount() {
 const session=useDemoSession();
 const navigate=useNavigate();
 const role=session?.role;
 const name=role==='participant'?'Priya Nair':role==='volunteer'?'Shivam Kapoor':'Meera';
 return <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
  <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">{name.split(' ').map(n=>n[0]).join('')}</span>
  <span className="text-xs font-medium text-primary">{name}</span>
  <span className={cn('rounded-md px-2 py-1 text-xs font-semibold',role==='participant'?'bg-sun-orange text-primary':role==='volunteer'?'bg-purple text-primary-foreground':'bg-primary text-primary-foreground')}>{role==='participant'?'Participant view':role==='volunteer'?'Volunteer view':'Admin view'}</span>
  <Button variant="link" size="sm" className="shrink-0 px-1" onClick={()=>{session?.signOut();void navigate({to:'/demo-login',replace:true});}}>Sign out</Button>
 </div>;
}