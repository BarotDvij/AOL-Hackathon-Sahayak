import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useDemoSession } from '@/lib/journey/demo-session';
import { cn } from '@/lib/utils';

export function DemoAccount() {
 const session=useDemoSession();
 const navigate=useNavigate();
 const role=session?.role;
 return <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
  <span className={cn('rounded-md px-2 py-1 text-xs font-semibold',role==='participant'?'bg-sun-orange text-primary':role==='volunteer'?'bg-purple text-primary-foreground':'bg-primary text-primary-foreground')}>{role==='participant'?'Participant view':role==='volunteer'?'Volunteer view':'Admin view'}</span>
  <Button variant="link" size="sm" onClick={()=>{session?.signOut();void navigate({to:'/demo-login',replace:true});}}>Sign out</Button>
 </div>;
}