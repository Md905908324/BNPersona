/** Match typographic/whitespace variants while returning the exact source span.
 * No fuzzy semantic matching: an unsupported or paraphrased quote stays rejected. */
export function alignExcerpt(source:string,excerpt:string):string|undefined{
 if(source.includes(excerpt))return excerpt;
 const normalize=(char:string)=>char.normalize('NFKC').toLowerCase().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—−]/g,'-');
 let text='';const positions:number[]=[];for(let i=0;i<source.length;i++){for(const char of normalize(source[i])){const c=/\s/.test(char)?' ':char;if(c===' '&&text.endsWith(' '))continue;text+=c;positions.push(i);}}
 const quote=[...excerpt].map(normalize).join('').replace(/\s+/g,' ').trim().replace(/^\.{3}|\.{3}$/g,'').trim();
 const at=text.indexOf(quote);if(at<0||quote.length<6)return undefined;
 return source.slice(positions[at],positions[at+quote.length-1]+1);
}
