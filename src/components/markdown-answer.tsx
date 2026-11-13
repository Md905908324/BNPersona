'use client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {calendarText} from '@/lib/timeline';
import {useEvidenceLabels} from './evidence-labels';
export function MarkdownAnswer({text}:{text:string}){
 const {labels,open}=useEvidenceLabels();
 const content=calendarText(text).replace(/\[([^\]\n]+)\]/g,(whole,ids:string)=>{const parts=ids.split(/,\s*/);return parts.every(id=>labels.has(id))?parts.map(id=>`[${labels.get(id)}](#evidence-${id})`).join(', '):whole;});
 return <div className="markdown-answer"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{a:({children,href})=>href?.startsWith('#evidence-')?<button className="source-link" onClick={()=>open(href.slice(10))}>{children}</button>:<a href={href} target="_blank" rel="noreferrer">{children}</a>}}>{content}</Markdown></div>;
}
