import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'BNPersona — Client Intelligence',description:'Evidence-led client discovery and tailored engagement for corporate banking product specialists.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
