import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import EmptyOrderHistory from "@/app/components/order/history/EmptyOrderHistory";
import OrderHistory from "@/app/components/order/history/OrderHistory";

export default async function Orders({ searchParams }) {
  const { order: paramOrderNumber } = (await searchParams) || {};

  const session = await getServerSession(authOptions);

  let userOrders = [],
    orderToTrack = null,
    legalPolicyPdfLinks = {};

  if (session?.user?.email) {
    try {
      const result = await tokenizedFetch(
        `/api/order/customer?email=${session?.user?.email}`,
      );

      userOrders = result.data || [];

      orderToTrack =
        userOrders.find((order) => order.order_number == paramOrderNumber) ||
        null;
    } catch (error) {
      console.error("FetchError (orderHistory/userOrders):", error.message);
    }
  }

  try {
    const result = await rawFetch("/api/policy-pdf/all", {
      next: {
        revalidate: 604800, // 7 days — legal documents rarely change
        tags: ['policy-pdf']
      }
    }
    );
    legalPolicyPdfLinks = result.data || {};
  } catch (error) {
    console.error("FetchError (orderHistory/legalPdfLinks):", error.message);
  }

  if (!userOrders?.length) return <EmptyOrderHistory />;
  else
    return (
      <OrderHistory
        orders={userOrders}
        orderToTrack={orderToTrack}
        legalPolicyPdfLinks={legalPolicyPdfLinks}
      />
    );
}
