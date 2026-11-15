import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type DemoRole = 'admin' | 'volunteer' | 'participant';
export const DEMO_SESSION_KEY = 'journey-demo-session';
export const SHIVAM_ID = 'v4';
export function readDemoRole(value: string | null): DemoRole | null { return value === 'admin' || value === 'volunteer' || value === 'participant' ? value : null; }
export function demoHome(role: DemoRole | null) { return role === 'participant' ? '/me' : role ? '/' : '/demo-login'; }
export function demoPageVisible(role: DemoRole | null, path: string) {
 if (!role) return false;
 if (role === 'participant') return path === '/me' || path.startsWith('/me/');
 if (path === '/me' || path.startsWith('/me/')) return false;
 if (role === 'admin') return true;
 return ['/', '/participants', '/review', '/inbox', '/sessions', `/groups/${SHIVAM_ID}`].some(p=>path===p || (p==='/sessions' && path.startsWith(p+'/')));
}
const Context = createContext<{ role: DemoRole | null; ready: boolean; signIn:(role:DemoRole)=>void; signOut:()=>void } | null>(null);
export function DemoSessionProvider({children}:{children:ReactNode}) {
 const [role,setRole]=useState<DemoRole|null>(null); const [ready,setReady]=useState(false);
 useEffect(()=>{try {setRole(readDemoRole(localStorage.getItem(DEMO_SESSION_KEY)));} catch {} setReady(true);},[]);
 const signIn=(value:DemoRole)=>{setRole(value);try {localStorage.setItem(DEMO_SESSION_KEY,value);} catch {}};
 const signOut=()=>{setRole(null);try {localStorage.removeItem(DEMO_SESSION_KEY);} catch {}};
 return <Context.Provider value={{role,ready,signIn,signOut}}>{children}</Context.Provider>;
}
export const useDemoSession=()=>useContext(Context);
