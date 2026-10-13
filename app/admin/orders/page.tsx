import {redirect} from 'next/navigation';
import {requireRole} from '@/lib/auth/session';
import {prisma} from '@/lib/database/prisma';
import {Navbar} from '@/components/site/Navbar';

export const dynamic='force-dynamic';

export default async function AdminOrders(){
  try{
    await requireRole('ADMIN');
  }catch{
    redirect('/dashboard');
  }

  const orders=await prisma.order.findMany({
    include:{
      user:{
        select:{
          username:true,
          email:true
        }
      },
      payments:true,
      items:true
    },
    orderBy:{
      createdAt:'desc'
    },
    take:100
  });

  return (
    <>
      <Navbar/>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">
              Orders
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage customer orders and payment status.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-card px-4 py-3">
            <p className="text-xs text-slate-500">
              Total Orders
            </p>

            <p className="mt-1 text-xl font-bold text-white">
              {orders.length}
            </p>
          </div>
        </div>

        <div className="mt-8 card overflow-hidden">
          {orders.length===0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-400">
                Belum ada order.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {orders.map(o=>(
                <div
                  className="p-5"
                  key={o.id}
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <b className="text-white">
                        {o.orderNumber}
                      </b>

                      <p className="mt-1 text-xs text-slate-500">
                        {o.user.username} • {o.user.email}
                      </p>
                    </div>

                    <span className="rounded-lg bg-card px-3 py-1 text-xs text-slate-300">
                      {o.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">
                        Total
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {new Intl.NumberFormat(
                          'id-ID',
                          {
                            style:'currency',
                            currency:'IDR',
                            maximumFractionDigits:0
                          }
                        ).format(o.total)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Items
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {o.items.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Payment
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {o.payments.length > 0
                          ? o.payments[0].status
                          : 'No payment'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}