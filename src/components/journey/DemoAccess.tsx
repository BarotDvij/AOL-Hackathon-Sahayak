import { useEffect, type ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { demoHome, demoPageVisible, useDemoSession } from '@/lib/journey/demo-session';

/** Browser-local demo navigation only; this is not authentication. */
export function DemoAccess({ children }: { children: ReactNode }) {
 const session = useDemoSession();
 const navigate = useNavigate();
 const path = useRouterState({select:s=>s.location.pathname});
 const external = path === '/auth' || path.startsWith('/api/') || path.startsWith('/.well-known/') || path === '/.lovable.oauth.consent' || path === '/mcp' || path.startsWith('/check-in.');
 const login = path === '/demo-login' || path === '/start';
 const allowed = external || (!login && demoPageVisible(session?.role ?? null,path,session?.volunteerId));
 useEffect(()=>{
  if (session?.ready && !allowed) void navigate({to:demoHome(session.role),replace:true});
 },[session?.ready,session?.role,allowed,path,navigate]);
 if (!external && (!session?.ready || !allowed || path === '/start')) return <div className="min-h-dvh bg-background" />;
 return children;
}