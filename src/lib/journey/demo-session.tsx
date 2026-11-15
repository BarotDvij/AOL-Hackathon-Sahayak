import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type DemoRole = 'admin' | 'volunteer' | 'participant';
export const DEMO_SESSION_KEY = 'journey-demo-session';
export const SHIVAM_ID = 'v4';
export function readDemoRole(value: string | null): DemoRole | null { return value === 'admin' || value === 'volunteer' || value === 'participant' ? value : null; }
export function demoHome(role: DemoRole | null) { return role === 'participant' ? '/me' : role ? '/' : '/demo-login'; }
export function demoPageVisible(role: DemoRole | null, path: string, volunteerId=SHIVAM_ID) {
 if (!role) return false;
 if (role === 'participant') return path === '/me' || path.startsWith('/me/');
 if (role === 'admin') return true;
 return ['/', '/participants', '/review', '/inbox', '/sessions', `/groups/${volunteerId}`].some(p=>path===p || (p==='/sessions' && path.startsWith(p+'/')));
}
const Context = createContext<{ role: DemoRole | null; ready: boolean; volunteerId:string; participantId:string; selectVolunteer:(id:string)=>void; selectParticipant:(id:string)=>void; signIn:(role:DemoRole)=>void; signOut:()=>void } | null>(null);
export function DemoSessionProvider({children}:{children:ReactNode}) {
 const [role,setRole]=useState<DemoRole|null>(null); const [ready,setReady]=useState(false);
 const [volunteerId,setVolunteerId]=useState(SHIVAM_ID); const [participantId,setParticipantId]=useState('p05');
 useEffect(()=>{try {setRole(readDemoRole(localStorage.getItem(DEMO_SESSION_KEY)));} catch {} setReady(true);},[]);
 const signIn=(value:DemoRole)=>{setRole(value);setVolunteerId(SHIVAM_ID);setParticipantId('p05');try {localStorage.setItem(DEMO_SESSION_KEY,value);} catch {}};
 const signOut=()=>{setRole(null);try{localStorage.removeItem(DEMO_SESSION_KEY);}catch{}};
 const selectVolunteer=(id:string)=>{setVolunteerId(id);try{localStorage.setItem('journey-demo-volunteer',id);}catch{}};
 const selectParticipant=(id:string)=>{setParticipantId(id);try{localStorage.setItem('journey-demo-participant',id);}catch{}};
 return <Context.Provider value={{role,ready,volunteerId,participantId,selectVolunteer,selectParticipant,signIn,signOut}}>{children}</Context.Provider>;
}
export const useDemoSession=()=>useContext(Context);
