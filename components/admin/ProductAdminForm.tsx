'use client';

import {useState} from 'react';

export function ProductAdminForm({
  categories
}:{
  categories:{id:string,name:string}[];
}){
  const [form,setForm]=useState({
    name:'',
    slug:'',
    description:'',
    price:'',
    categoryId:categories[0]?.id||'',
    thumbnailUrl:'',
    features:'',
    requirements:'',
    robloxCompat:'',
    discountPercent:'0',
    licenseType:'PERSONAL',
    licenseMode:'NONE' as 'NONE'|'REQUIRED'|'OPTIONAL',
    sourceMode:'CLOSED_SOURCE' as 'CLOSED_SOURCE'|'OPEN_SOURCE',
    featured:false
  });

  const [msg,setMsg]=useState('');

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setMsg('Saving...');

    try{
      const r=await fetch('/api/admin/products',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          ...form,
          price:Number(form.price),
          discountPercent:Number(form.discountPercent),
          features:form.features
            .split('\n')
            .map(x=>x.trim())
            .filter(Boolean)
        })
      });

      const j=await r.json();

      setMsg(
        r.ok
          ? 'Product created. Refresh the page.'
          : j.error?.message||'Failed'
      );
    }catch{
      setMsg('Failed to create product.');
    }
  }

  return(
    <form
      onSubmit={submit}
      className="card grid gap-4 p-6 md:grid-cols-2"
    >
      <h2 className="text-xl font-bold text-white md:col-span-2">
        Create product
      </h2>

      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={e=>
          setForm({...form,name:e.target.value})
        }
      />

      <input
        className="input"
        placeholder="slug"
        value={form.slug}
        onChange={e=>
          setForm({...form,slug:e.target.value})
        }
      />

      <input
        className="input"
        placeholder="Price IDR"
        type="number"
        min="0"
        value={form.price}
        onChange={e=>
          setForm({...form,price:e.target.value})
        }
      />

      <input
        className="input"
        placeholder="Discount %"
        type="number"
        min="0"
        max="100"
        value={form.discountPercent}
        onChange={e=>
          setForm({...form,discountPercent:e.target.value})
        }
      />

      <select
        className="input"
        value={form.categoryId}
        onChange={e=>
          setForm({...form,categoryId:e.target.value})
        }
      >
        {categories.map(c=>(
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        className="input"
        placeholder="Thumbnail URL"
        value={form.thumbnailUrl}
        onChange={e=>
          setForm({...form,thumbnailUrl:e.target.value})
        }
      />

      <textarea
        className="input min-h-28 md:col-span-2"
        placeholder="Description"
        value={form.description}
        onChange={e=>
          setForm({...form,description:e.target.value})
        }
      />

      <textarea
        className="input min-h-24"
        placeholder="Features, one per line"
        value={form.features}
        onChange={e=>
          setForm({...form,features:e.target.value})
        }
      />

      <textarea
        className="input min-h-24"
        placeholder="Requirements"
        value={form.requirements}
        onChange={e=>
          setForm({...form,requirements:e.target.value})
        }
      />

      <input
        className="input"
        placeholder="Roblox compatibility"
        value={form.robloxCompat}
        onChange={e=>
          setForm({...form,robloxCompat:e.target.value})
        }
      />

      <select
        className="input"
        value={form.licenseType}
        onChange={e=>
          setForm({...form,licenseType:e.target.value})
        }
      >
        <option value="PERSONAL">
          Personal License
        </option>
        <option value="COMMERCIAL">
          Commercial License
        </option>
        <option value="UNLIMITED">
          Unlimited License
        </option>
      </select>

      <select
        className="input"
        value={form.licenseMode}
        onChange={e=>
          setForm({
            ...form,
            licenseMode:e.target.value as
              'NONE'|'REQUIRED'|'OPTIONAL'
          })
        }
      >
        <option value="NONE">
          No License
        </option>
        <option value="REQUIRED">
          License Required
        </option>
        <option value="OPTIONAL">
          License Optional
        </option>
      </select>

      <select
        className="input"
        value={form.sourceMode}
        onChange={e=>
          setForm({
            ...form,
            sourceMode:e.target.value as
              'CLOSED_SOURCE'|'OPEN_SOURCE'
          })
        }
      >
        <option value="CLOSED_SOURCE">
          Closed Source
        </option>
        <option value="OPEN_SOURCE">
          Open Source
        </option>
      </select>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
        <div className="mb-3 text-sm font-semibold text-white">
          Distribution Settings
        </div>

        <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
          <div>
            <span className="text-slate-500">
              License
            </span>
            <div className="mt-1 font-medium text-white">
              {form.licenseMode==='NONE'
                ? 'No License'
                : form.licenseMode==='REQUIRED'
                  ? 'License Required'
                  : 'License Optional'}
            </div>
          </div>

          <div>
            <span className="text-slate-500">
              Source
            </span>
            <div className="mt-1 font-medium text-white">
              {form.sourceMode==='OPEN_SOURCE'
                ? 'Open Source'
                : 'Closed Source'}
            </div>
          </div>

          <div>
            <span className="text-slate-500">
              License Type
            </span>
            <div className="mt-1 font-medium text-white">
              {form.licenseType}
            </div>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={e=>
            setForm({
              ...form,
              featured:e.target.checked
            })
          }
        />

        Featured
      </label>

      <button
        type="submit"
        className="btn-primary md:col-span-2"
      >
        Create product
      </button>

      {msg&&(
        <p className="text-sm text-slate-400 md:col-span-2">
          {msg}
        </p>
      )}
    </form>
  );
}