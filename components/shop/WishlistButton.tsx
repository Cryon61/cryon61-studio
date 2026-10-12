'use client';
import {useState} from 'react';
export function WishlistButton({productId}:{productId:string}){const [saved,setSaved]=useState(false);async function toggle(){const r=await fetch('/api/wishlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId})});if(r.status===401){location.href='/login';return;}setSaved(r.ok);if(r.ok){setTimeout(()=>location.href='/wishlist',500)}}return <button onClick={toggle} className="btn-ghost w-full">{saved?'Saved ✓':'♡ Add to wishlist'}</button>}
