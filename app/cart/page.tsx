import {redirect} from 'next/navigation';
import {getCurrentUser} from '@/lib/auth/session';
import {prisma} from '@/lib/database/prisma';
import {Navbar} from '@/components/site/Navbar';
import {CartClient} from '@/components/shop/CartClient';
export const dynamic='force-dynamic';
export default async function CartPage(){const u=await getCurrentUser();if(!u)redirect('/login?next=/cart');const cart=await prisma.cart.findUnique({where:{userId:u.id},include:{items:{include:{product:true}}}});const items=(cart?.items||[]).filter(x=>x.product.status==='PUBLISHED').map(x=>({product:x.product,finalPrice:Math.round(x.product.price*(100-x.product.discountPercent)/100)}));return <><Navbar/><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-black text-white">Your cart</h1><p className="mt-2 text-slate-500">Review your products before checkout.</p><div className="mt-8"><CartClient items={items}/></div></main></>}
