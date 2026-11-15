import { expect, it } from 'vitest';
import { participantCsv } from './participant-csv';
it('exports sample participant fields and protects spreadsheet cells', () => {
 const csv = participantCsv([{ id:'p1', firstName:'Meera', lastName:'Shah', age:32, city:'Montréal', email:'=HYPERLINK("unsafe")', phone:'+15145550123', language:'French', preferredChannel:'email', doNotContact:true, sevaRole:null, interests:['Meditation'] }]);
 expect(csv).toContain('"Meera Shah","Montréal","32"'); expect(csv).toContain('"true"'); expect(csv).toContain('"\'=HYPERLINK(""unsafe"")"');
});
