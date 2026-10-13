import {redirect} from 'next/navigation';
import {getCurrentUser} from '@/lib/auth/session';
import {prisma} from '@/lib/database/prisma';
import {Navbar} from '@/components/site/Navbar';
import {RobloxLink} from '@/components/licenses/RobloxLink';

export const dynamic='force-dynamic';

export default async function Licenses(){
  const u=await getCurrentUser();

  if(!u)redirect('/login?next=/licenses');

  const licenses=await prisma.license.findMany({
    where:{userId:u.id},
    include:{product:true},
    orderBy:{createdAt:'desc'}
  });

  return (
    <>
      <Navbar/>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-4xl font-black text-white">
          Licenses
        </h1>

        <p className="mt-2 text-slate-500">
          Your CRYON61 STUDIO product licenses.
        </p>

        <div className="mt-8 grid gap-4">
          {licenses.map(l=>(
            <div className="card p-5" key={l.id}>

              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-bold text-white">
                    {l.product.name}
                  </h2>

                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {l.key}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  {l.status}
                </span>
              </div>

              <RobloxLink
                licenseKey={l.key}
                currentId={l.robloxUserId}
              />

            </div>
          ))}

          {!licenses.length&&(
            <div className="card p-10 text-center text-slate-500">
              No licenses yet.
            </div>
          )}
        </div>
      </main>
    </>
  );
}