import type { Participant } from './types';
export function participantCsv(people: Participant[]) {
  const cell = (value: unknown) => {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const headers = ['ID', 'Name', 'City', 'Age', 'Email', 'Phone', 'Preferred channel', 'Language', 'Do not contact', 'Seva role', 'Interests'];
  return '\uFEFF' + [headers, ...people.map(p => [p.id, `${p.firstName} ${p.lastName}`, p.city, p.age, p.email, p.phone, p.preferredChannel, p.language, p.doNotContact, p.sevaRole, p.interests.join('; ')])].map(row => row.map(cell).join(',')).join('\r\n');
}
