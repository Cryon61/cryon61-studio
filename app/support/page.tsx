import { Navbar } from "@/components/site/Navbar";

export default function Support() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-black text-white">
          Support
        </h1>

        <p className="mt-3 text-slate-500">
          Need help with an order, license or product?
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-bold text-white">
              Discord
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Join the CRYON61 community for support,
              announcements and assistance.
            </p>

            <a
              className="btn-primary mt-5 inline-block"
              href="https://discord.gg/mbjgQAEm9"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </a>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-white">
              YouTube
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Follow CRYON61 on YouTube for tutorials,
              updates and new content.
            </p>

            <a
              className="btn-ghost mt-5 inline-block"
              href="https://youtube.com/@cryon61"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit YouTube
            </a>
          </div>

          <div className="card p-6 sm:col-span-2">
            <h2 className="font-bold text-white">
              Order support
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Include your order number when reporting a
              payment or delivery problem.
            </p>

            <a
              className="btn-ghost mt-5 inline-block"
              href="/orders"
            >
              View orders
            </a>
          </div>
        </div>
      </main>
    </>
  );
}