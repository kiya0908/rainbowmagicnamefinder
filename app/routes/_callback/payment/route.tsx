import { data, Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

import { handleOrderComplete } from "~/.server/services/order";
import { isDuplicateOrderCompletionError } from "~/.server/services/order-errors";
import { createCreem } from "~/.server/libs/creem";
import { getSessionHandler } from "~/.server/libs/session";
import { getUserCredits } from "~/.server/services/credits";

type PaymentCallbackLoaderData =
  | {
      success: true;
      credits: number;
      orderId: string;
    }
  | {
      success: false;
      message: string;
    };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const paramsRecord: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    paramsRecord[key] = value;
  });

  const { signature: creemSignature, ...rest } = paramsRecord;
  const creem = createCreem();
  const signature = creem.createCallbackSignature(rest);

  try {
    if (creemSignature !== signature) {
      throw Error("Invalid Signature");
    }

    // 无论成功还是失败，都在后台尝试完成订单
    // 实际可能在 webhook 已经处理过了，这里可以当做一种冗余检查
    try {
      await handleOrderComplete(rest.checkout_id);
    } catch (error) {
      const message = (error as Error).message;
      if (!isDuplicateOrderCompletionError(message)) {
        throw error;
      }
      console.log("Ignore callback duplicate completion: ", message);
    }

    // 获取最新的积分信息以便组件能够刷新
    let latestCredits = 0;
    const [session] = await getSessionHandler(request);
    const user = session.get("user");
    if (user) {
      const { balance } = await getUserCredits(user);
      latestCredits = balance;
    }

    return data<PaymentCallbackLoaderData>({
      success: true,
      credits: latestCredits,
      orderId: rest.order_id || rest.checkout_id,
    });
  } catch (error) {
    const message = (error as Error).message;
    console.log("Error Event: ", paramsRecord);
    console.log("Error Message: ", message);

    return data<PaymentCallbackLoaderData>({
      success: false,
      message,
    });
  }
};

export default function PaymentCallback() {
  const payload = useLoaderData<typeof loader>() as PaymentCallbackLoaderData;
  const success = payload.success;
  const credits = payload.success ? payload.credits : 0;
  const orderId = payload.success ? payload.orderId : null;
  const message = payload.success ? "" : payload.message;

  // 可以在这里通过 useEffect 同步最新 credits 到 Zustand userStore，
  // 但更推荐由 Navbar 自身负责轮询/查询刷新，这里仅作结果展示。

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6" >
      <div className="max-w-md w-full bg-bg-surface border border-border-subtle rounded-3xl p-8 shadow-2xl relative overflow-hidden" >
        {/* 背景光效 */}
        < div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-3xl opacity-20 pointer-events-none ${success ? 'bg-green-500' : 'bg-red-500'}`
        }> </div>

        < div className="relative z-10 flex flex-col items-center text-center" >
          {
            success ? (
              <>
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6" >
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                < h1 className="text-2xl md:text-3xl font-bold mb-4" > Payment Successful! </h1>
                < p className="text-text-secondary mb-8" >
                  Your payment has been processed successfully and your credit balance is ready to use.
                </p>

                < div className="w-full bg-bg-base rounded-xl p-4 mb-8 border border-border-subtle/50 text-left space-y-3" >
                  <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50" >
                    <span className="text-text-secondary text-sm" > Order Status </span>
                    < span className="text-green-500 text-sm font-medium flex items-center gap-1" >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" > </span>
                      Completed
                    </span>
                  </div>
                  {
                    orderId && (
                      <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50" >
                        <span className="text-text-secondary text-sm" > Reference </span>
                        < span className="text-white text-sm font-mono" > {String(orderId).slice(-8).toUpperCase()} </span>
                      </div>
                    )
                  }
                  <div className="flex justify-between items-center" >
                    <span className="text-text-secondary text-sm" > Current Balance </span>
                    < span className="text-blue-400 text-sm font-bold" > {credits} Credits </span>
                  </div>
                </div>

                < Link
                  to="/"
                  className="w-full py-4 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                >
                  Go to Editor < ArrowRight size={18} />
                </Link>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6" >
                  <XCircle size={40} className="text-red-500" />
                </div>
                < h1 className="text-2xl md:text-3xl font-bold mb-4" > Payment Failed </h1>
                < p className="text-text-secondary mb-8" >
                  We couldn & apos;t process your payment.Please check your payment details and try again.
                </p>

                < div className="w-full bg-bg-base/50 text-red-400/80 rounded-xl p-4 mb-8 border border-red-500/20 text-sm font-mono overflow-auto text-left" >
                  {message || "An unknown error occurred during the transaction."}
                </div>

                < Link
                  to="/#pricing"
                  className="w-full py-4 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                >
                  Return to Pricing
                </Link>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
