import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, ShieldCheck, Users, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoSession, demoHome, type DemoRole } from '@/lib/journey/demo-session';
import { useJourney } from '@/lib/journey/store';

export function DemoLogin() {
 const session=useDemoSession();
 const navigate=useNavigate();
 const {setMyFollowUps,setCity}=useJourney();
 const choose=(role:DemoRole)=>{setMyFollowUps(false);setCity('all');session?.signIn(role);void navigate({to:demoHome(role)});};
 return <main className="demo-login-background flex min-h-dvh items-center justify-center px-5 py-12"><div className="w-full max-w-5xl">
  <header className="text-center"><h1 className="font-display text-[32px] font-normal text-primary">Journey</h1><p className="mt-3 text-base text-muted-foreground">Choose how you want to sign in</p></header>
  <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3">{([
   {role:'participant',title:'Participant',line:'See your journey and what is next for you',Icon:UserRound},
   {role:'volunteer',title:'Volunteer',line:'Follow up with the people you know',Icon:Users},
   {role:'admin',title:'Admin',line:'Monitor all participants, volunteers and impact',Icon:ShieldCheck},
  ] as const).map(({role,title,line,Icon})=><Button key={role} aria-label={`Sign in as ${title}`} variant="outline" className="h-auto min-w-0 flex-col items-start whitespace-normal rounded-lg border-border bg-card p-6 text-left shadow-soft hover:border-purple" onClick={()=>choose(role)}><Icon className="mb-4 size-7 text-purple" aria-hidden/><span className="font-heading text-lg font-semibold">{title}</span><span className="mt-3 font-sans text-sm font-normal text-muted-foreground">{line}</span><ArrowRight className="mt-5 self-end text-purple" aria-hidden/></Button>)}</div>
  <p className="mt-8 text-center text-sm text-muted-foreground">Demo sign-in. No password needed.</p>
 </div></main>;
}