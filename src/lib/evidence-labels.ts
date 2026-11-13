import type {Source} from './types';
// IDs remain stable in stored records; ordinary display and exports use names.
export function readableEvidence(text:string,sources:Pick<Source,'id'|'title'>[]){
 const labels=new Map(sources.map(s=>[s.id,s.title]));
 return text.replace(/\b(?:[A-Z]{1,2}\d{3}|SRC-[\w-]+|profile-[\w-]+)\b/g,id=>labels.get(id)||id);
}
