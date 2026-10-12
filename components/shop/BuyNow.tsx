'use client';
import {useState} from 'react';
export function BuyNow({productId}:{productId:string}){const [loading,setLoading]=useState(false);async function go(){setLoading(true);const r=await fetch('/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId})});if(r.status===401){location.href='/login?next=/checkout';return;}location.href='/checkout';}return <button onClick={go} disabled={loading} className="btn-primary w-full">{loading?'Preparing...':'Buy now'}</button>}
