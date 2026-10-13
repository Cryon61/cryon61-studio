'use client';

import {useState} from 'react';

export function RobloxLink({
  licenseKey,
  currentId
}:{
  licenseKey:string;
  currentId:string|null;
}){
  const [id,setId]=useState(currentId||'');
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');

  async function submit(){
    if(!/^\d+$/.test(id)){
      setMessage('Roblox User ID harus berupa angka.');
      return;
    }

    setLoading(true);
    setMessage('');

    try{
      const r=await fetch('/api/licenses/activate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          licenseKey,
          robloxUserId:id
        })
      });

      const data=await r.json();

      if(!r.ok){
        throw new Error(
          data?.error?.message||'Gagal menghubungkan Roblox User ID.'
        );
      }

      setMessage('Roblox User ID berhasil dihubungkan.');
    }catch(e:any){
      setMessage(e.message||'Terjadi kesalahan.');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="text-sm text-slate-400">
        Roblox User ID:
        <span className="ml-1 text-white">
          {currentId||'Not linked'}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={id}
          onChange={e=>setId(e.target.value)}
          placeholder="Masukkan Roblox User ID"
          inputMode="numeric"
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 sm:max-w-xs"
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading?'Menghubungkan...':'Link Roblox'}
        </button>
      </div>

      {message&&(
        <p className="mt-2 text-xs text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}