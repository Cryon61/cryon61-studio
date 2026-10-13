import crypto from 'crypto';
import {prisma} from '@/lib/database/prisma';
import {handle,ok,ApiError} from '@/lib/utils/api';

export const POST=handle(async(req: Request)=>{
  const body:any=await req.json();

  const key=process.env.MIDTRANS_SERVER_KEY;

  if(!key){
    throw new ApiError(
      'INTERNAL_ERROR',
      'Payment gateway is not configured',
      500
    );
  }

  const raw=
    `${body.order_id||''}`+
    `${body.status_code||''}`+
    `${body.gross_amount||''}`+
    `${key}`;

  const expected=crypto
    .createHash('sha512')
    .update(raw)
    .digest('hex');

  if(
    body.signature_key&&
    body.signature_key!==expected
  ){
    throw new ApiError(
      'FORBIDDEN',
      'Invalid payment signature',
      403
    );
  }

  const transactionStatus=
    String(body.transaction_status||'').toLowerCase();

  const transactionId=
    String(
      body.transaction_id||
      body.order_id||
      ''
    );

  const eventId=
    `${transactionId}:${transactionStatus}`;

  const existing=
    await prisma.webhookEvent.findUnique({
      where:{
        provider_eventId:{
          provider:'midtrans',
          eventId
        }
      }
    });

  if(existing){
    return ok({
      processed:true
    });
  }

  const order=
    await prisma.order.findUnique({
      where:{
        orderNumber:String(body.order_id)
      },
      include:{
        items:{
          include:{
            product:true
          }
        }
      }
    });

  if(!order){
    return ok({
      ignored:true
    });
  }

  await prisma.webhookEvent.create({
    data:{
      provider:'midtrans',
      eventId,
      payload:body
    }
  });

  const status=transactionStatus;

  let ps:any='PENDING';
  let os:any='PENDING';

  if(
    status==='settlement'||
    status==='capture'
  ){
    ps='PAID';
    os='COMPLETED';
  }else if(status==='expire'){
    ps='EXPIRED';
    os='CANCELLED';
  }else if(
    ['deny','cancel'].includes(status)
  ){
    ps='FAILED';
    os='CANCELLED';
  }

  await prisma.$transaction(async tx=>{
    const payment=
      await tx.payment.findFirst({
        where:{
          orderId:order.id,
          provider:'midtrans'
        }
      });

    if(payment){
      await tx.payment.update({
        where:{
          id:payment.id
        },
        data:{
          status:ps,
          paidAt:
            ps==='PAID'
              ?new Date()
              :undefined,
          providerRef:
            body.transaction_id||
            payment.providerRef,
          rawPayload:body
        }
      });
    }

    if(
      os==='COMPLETED'&&
      order.status!=='COMPLETED'
    ){
      await tx.order.update({
        where:{
          id:order.id
        },
        data:{
          status:'COMPLETED'
        }
      });

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

        /*
         * License hanya dibuat jika produk
         * menggunakan License Mode REQUIRED.
         *
         * NONE     = Tidak ada license
         * REQUIRED = License otomatis dibuat
         * OPTIONAL = Tidak otomatis dibuat
         */
        if(item.product.licenseMode==='REQUIRED'){

          const existingLicense=
            await tx.license.findFirst({
              where:{
                productId:item.productId,
                userId:order.userId,
                orderId:order.id
              }
            });

          if(!existingLicense){

            const licenseKey=
              `CRYON61-${item.productId
                .slice(-6)
                .toUpperCase()}-`+
              `${crypto
                .randomBytes(4)
                .toString('hex')
                .toUpperCase()}-`+
              `${crypto
                .randomBytes(4)
                .toString('hex')
                .toUpperCase()}`;

            await tx.license.create({
              data:{
                key:licenseKey,
                productId:item.productId,
                userId:order.userId,
                orderId:order.id
              }
            });
          }
        }
      }

      await tx.cart.deleteMany({
        where:{
          userId:order.userId
        }
      });
    }
  });

  await prisma.webhookEvent.update({
    where:{
      provider_eventId:{
        provider:'midtrans',
        eventId
      }
    },
    data:{
      processedAt:new Date()
    }
  });

  return ok({
    processed:true
  });
});