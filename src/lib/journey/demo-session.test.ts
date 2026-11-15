import { expect,it } from 'vitest';
import { readDemoRole,demoPageVisible,SHIVAM_ID } from './demo-session';
it('remembers only the two demo roles',()=>{expect(readDemoRole('admin')).toBe('admin');expect(readDemoRole('volunteer')).toBe('volunteer');expect(readDemoRole('owner')).toBeNull();});
it('hides Impact Team and Settings for volunteers but keeps all for Admin',()=>{for(const path of ['/impact','/team','/settings']){expect(demoPageVisible('volunteer',path)).toBe(false);expect(demoPageVisible('admin',path)).toBe(true);}expect(demoPageVisible('volunteer','/participants')).toBe(true);expect(SHIVAM_ID).toBe('v4');});
