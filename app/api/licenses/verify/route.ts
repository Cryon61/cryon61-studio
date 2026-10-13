import {z} from 'zod';
import {prisma} from '@/lib/database/prisma';
import {handle,ok,ApiError} from '@/lib/utils/api';
import {enforceRateLimit} from '@/lib/security/request';

const s=z.object({
  licenseKey:z.string().min(10),
  robloxUserId:z.string().regex(/^\d+$/)
});

export const POST=handle(async(req: Request)=>{
  enforceRateLimit(req,'license',60,60000);

  const secret=process.env.ROBLOX_LICENSE_SECRET;
  const providedSecret=req.headers.get('x-roblox-license-secret');

  if(!secret||providedSecret!==secret){
    throw new ApiError(
      'UNAUTHORIZED',
      'Invalid license verification secret.',
      401
    );
  }

  const b=s.parse(await req.json());

  const l=await prisma.license.findUnique({
    where:{key:b.licenseKey},
    include:{product:true}
  });

  if(!l||l.status!=='ACTIVE'||(l.expiresAt&&l.expiresAt<new Date())){
    return ok({
      valid:false,
      reason:'INVALID_LICENSE'
    });
  }

  if(!l.robloxUserId){
    return ok({
      valid:false,
      reason:'ROBLOX_NOT_LINKED'
    });
  }

  if(l.robloxUserId!==b.robloxUserId){
    return ok({
      valid:false,
      reason:'ROBLOX_USER_MISMATCH'
    });
  }

  return ok({
    valid:true,
    status:l.status,
    product:l.product.name,
    userId:l.robloxUserId
  });
});