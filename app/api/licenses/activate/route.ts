import {z} from 'zod';
import {prisma} from '@/lib/database/prisma';
import {getCurrentUser} from '@/lib/auth/session';
import {ApiError,handle,ok} from '@/lib/utils/api';
import {assertSameOrigin} from '@/lib/security/request';

const s=z.object({
  licenseKey:z.string(),
  robloxUserId:z.string().regex(/^\d+$/),
  placeId:z.string().optional()
});

export const POST=handle(async(req: Request)=>{
  assertSameOrigin(req);

  const u=await getCurrentUser();

  if(!u){
    throw new ApiError('UNAUTHORIZED','Login required',401);
  }

  const b=s.parse(await req.json());

  const l=await prisma.license.findUnique({
    where:{key:b.licenseKey}
  });

  if(!l||l.userId!==u.id||l.status!=='ACTIVE'){
    throw new ApiError('NOT_FOUND','License not found',404);
  }

  if(l.robloxUserId){
    if(l.robloxUserId===b.robloxUserId){
      return ok({
        activated:true,
        robloxUserId:l.robloxUserId,
        alreadyLinked:true
      });
    }

    throw new ApiError(
      'CONFLICT',
      'License ini sudah terhubung ke Roblox User ID lain.',
      409
    );
  }

  await prisma.$transaction(async tx=>{
    await tx.license.update({
      where:{id:l.id},
      data:{robloxUserId:b.robloxUserId}
    });

    await tx.licenseActivation.create({
      data:{
        licenseId:l.id,
        robloxUserId:b.robloxUserId,
        placeId:b.placeId
      }
    });
  });

  return ok({
    activated:true,
    robloxUserId:b.robloxUserId
  });
});