import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {calendarText} from '@/lib/timeline';
export function MarkdownAnswer({text}:{text:string}){
 return <div className="markdown-answer"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{a:({children,href})=><a href={href} target="_blank" rel="noreferrer">{children}</a>}}>{calendarText(text)}</Markdown></div>;
}
