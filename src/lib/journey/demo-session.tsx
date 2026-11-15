import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type DemoRole = 'admin' | 'volunteer';
export const DEMO_SESSION_KEY = 'journey-demo-session';
export const SHIVAM_ID = 'v4';
export function readDemoRole(value: string | null): DemoRole | null { return value === 'admin' || value === 'volunteer' ? value : null; }
export function demoPageVisible(role: DemoRole | null, path: string) { return role !== 'volunteer' || !['/impact','/team','/settings','/sahayak'].some(p=>path===p||path.startsWith(p+'/')); }
const Context = createContext<{ role: DemoRole | null; ready: boolean; signIn:(role:DemoRole)=>void; signOut:()=>void } | null>(null);
export function DemoSessionProvider({children}:{children:ReactNode}) {
 const [role,setRole]=useState<DemoRole|null>(null); const [ready,setReady]=useState(false);
 useEffect(()=>{try {setRole(readDemoRole(localStorage.getItem(DEMO_SESSION_KEY)));} catch {} setReady(true);},[]);
 const signIn=(value:DemoRole)=>{setRole(value);try {localStorage.setItem(DEMO_SESSION_KEY,value);} catch {}};
 const signOut=()=>{setRole(null);try {localStorage.removeItem(DEMO_SESSION_KEY);} catch {}};
 return <Context.Provider value={{role,ready,signIn,signOut}}>{children}</Context.Provider>;
}
export const useDemoSession=()=>useContext(Context);
