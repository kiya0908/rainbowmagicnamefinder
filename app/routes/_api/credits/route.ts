import type { Route } from "./+types/route";
import { data } from "react-router";

import { getSessionHandler } from "~/.server/libs/session";
import { getUserCredits } from "~/.server/services/credits";
import { listCreditConsumptionsByUser } from "~/.server/model/credit_consumptions";

/**
 * 独立积分查询 API
 * GET /api/credits — 返回当前用户的积分余额和最近消费记录
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
    const [session] = await getSessionHandler(request);
    const user = session.get("user");

    if (!user) {
        throw new Response("Unauthorized", { status: 401 });
    }

    // 获取积分余额
    const { balance, list: creditRecords } = await getUserCredits(user);

    // 获取最近消费记录（默认前 20 条）
    const consumptions = await listCreditConsumptionsByUser(user.id, 1, 20);

    return data({
        balance,
        // 积分记录概要
        records: creditRecords.map((r) => ({
            id: r.id,
            credits: r.credits,
            remaining: r.remaining_credits,
            type: r.trans_type,
            source_type: r.source_type,
            expired_at: r.expired_at?.valueOf() ?? null,
            created_at: r.created_at.valueOf(),
        })),
        // 最近消费记录
        consumptions: {
            data: consumptions.data.map((c) => ({
                id: c.id,
                credits: c.credits,
                source_type: c.source_type,
                source_id: c.source_id,
                reason: c.reason,
                created_at: c.created_at.valueOf(),
            })),
            pagination: consumptions.pagination,
        },
    });
};
