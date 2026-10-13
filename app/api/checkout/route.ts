import crypto from 'crypto';
import {z} from 'zod';
import {prisma} from '@/lib/database/prisma';
import {getCurrentUser} from '@/lib/auth/session';
import {ApiError,handle,ok} from '@/lib/utils/api';
import {assertSameOrigin,enforceRateLimit} from '@/lib/security/request';
import {midtrans} from '@/lib/payments/midtrans';
import {orderNumber} from '@/lib/utils/order';

const s=z.object({
  provider:z.string().default('midtrans')
});

export const POST=handle(async(req: Request)=>{
  assertSameOrigin(req);
  enforceRateLimit(req,'checkout',10,60000);

  const u=await getCurrentUser();

  if(!u){
    throw new ApiError('UNAUTHORIZED','Login required',401);
  }

  const b=s.parse(await req.json());

  const cart=await prisma.cart.findUnique({
    where:{userId:u.id},
    include:{
      items:{
        include:{
          product:true
        }
      }
    }
  });

  if(!cart||!cart.items.length){
    throw new ApiError('CONFLICT','Your cart is empty',409);
  }

  const productIds=cart.items.map(x=>x.productId);

  const owned=await prisma.license.findMany({
    where:{
      userId:u.id,
      productId:{
        in:productIds
      },
      status:'ACTIVE'
    }
  });

  const ownedIds=new Set(
    owned.map(x=>x.productId)
  );

  const items=cart.items
    .filter(x=>
      x.product.status==='PUBLISHED' &&
      (!ownedIds.has(x.productId)||x.product.allowRepurchase)
    )
    .map(x=>({
      product:x.product,
      finalPrice:Math.round(
        x.product.price*
        (100-x.product.discountPercent)/
        100
      )
    }));

  if(!items.length){
    throw new ApiError(
      'CONFLICT',
      'All cart items are already owned',
      409
    );
  }

  const subtotal=items.reduce(
    (sum,x)=>sum+x.finalPrice,
    0
  );

  let discount=0;
  let couponId:string|undefined;

  if(cart.couponCode){
    const c=await prisma.coupon.findUnique({
      where:{
        code:cart.couponCode
      }
    });

    if(
      c &&
      c.active &&
      (!c.expiresAt||c.expiresAt>new Date()) &&
      subtotal>=c.minPurchase
    ){
      discount=
        c.type==='PERCENTAGE'
          ? Math.min(
              subtotal,
              Math.floor(subtotal*c.value/100)
            )
          : Math.min(
              subtotal,
              c.value
            );

      couponId=c.id;
    }
  }

  const total=Math.max(
    0,
    subtotal-discount
  );

  const number=orderNumber();

  /*
   * FREE / TOTAL 0
   *
   * Tidak perlu Midtrans.
   * Order langsung COMPLETED.
   *
   * Jika licenseMode REQUIRED:
   * - buat license otomatis
   *
   * Jika NONE:
   * - tidak membuat license
   *
   * Jika OPTIONAL:
   * - tidak membuat license otomatis
   */
  if(total===0){
    const order=await prisma.order.create({
      data:{
        orderNumber:number,
        userId:u.id,
        subtotal,
        discountTotal:discount,
        total,
        couponId,
        status:'COMPLETED',
        items:{
          create:items.map(x=>({
            productId:x.product.id,
            sellerId:x.product.sellerId,
            name:x.product.name,
            unitPrice:x.finalPrice,
            discount:x.product.discountPercent,
            total:x.finalPrice,
            commission:0
          }))
        }
      },
      include:{
        items:{
          include:{
            product:true
          }
        }
      }
    });

    await prisma.$transaction(async tx=>{
      for(const item of order.items){

        await tx.product.update({
          where:{
            id:item.productId
          },
          data:{
            salesCount:{
              increment:1
            }
          }
        });

        if(item.product.licenseMode==='REQUIRED'){

          const existingLicense=await tx.license.findFirst({
            where:{
              productId:item.productId,
              userId:u.id,
              orderId:order.id
            }
          });

          if(!existingLicense){

            const licenseKey=
              `CRYON61-${item.productId.slice(-6).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            await tx.license.create({
              data:{
                key:licenseKey,
                productId:item.productId,
                userId:u.id,
                orderId:order.id
              }
            });
          }
        }
      }

      await tx.cart.deleteMany({
        where:{
          userId:u.id
        }
      });
    });

    return ok({
      orderId:order.id,
      orderNumber:number,
      paymentUrl:'/orders'
    });
  }

  /*
   * PAID ORDER
   *
   * Semua pembayaran berbayar tetap melalui Midtrans.
   *
   * License:
   * - REQUIRED  -> dibuat oleh webhook setelah pembayaran sukses
   * - NONE      -> tidak dibuat
   * - OPTIONAL  -> tidak dibuat otomatis
   */

  if(b.provider!=='midtrans'){
    throw new ApiError(
      'VALIDATION_ERROR',
      'Unsupported payment provider',
      422
    );
  }

  const order=await prisma.order.create({
    data:{
      orderNumber:number,
      userId:u.id,
      subtotal,
      discountTotal:discount,
      total,
      couponId,
      items:{
        create:items.map(x=>({
          productId:x.product.id,
          sellerId:x.product.sellerId,
          name:x.product.name,
          unitPrice:x.finalPrice,
          discount:x.product.discountPercent,
          total:x.finalPrice,
          commission:0
        }))
      }
    }
  });

  const snap=await midtrans(
    number,
    total,
    u.email,
    items
  );

  const paymentUrl=snap.redirect_url;

  await prisma.payment.create({
    data:{
      orderId:order.id,
      provider:'midtrans',
      method:'snap',
      providerRef:number,
      amount:total,
      paymentUrl
    }
  });

  return ok({
    orderId:order.id,
    orderNumber:number,
    paymentUrl
  });
});