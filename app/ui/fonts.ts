import {Inter} from 'next/font/google';
import { Lusitana } from 'next/font/google';

// Import the Inter font from the next/font/google module - this will be your primary font. Then, specify what subset you'd like to load. In this case, 'latin':

export const inter = Inter({subsets: ['latin']});
export const lusitana = Lusitana({
    subsets: ['latin'],
    weight: ['400', '700'],
});