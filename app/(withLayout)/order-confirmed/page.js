import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import OrderConfirmedContents from "@/app/components/order-confirmed/OrderConfirmedContents";

export default async function OrderConfirmed({ searchParams }) {
  const orderNumber = searchParams?.order;
  if (!orderNumber) redirect("/");

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  const res = await tokenizedFetch(`/api/order/${orderNumber}`);
  if (!res?.ok) redirect("/");

  // Authorization: confirm this order belongs to the logged-in user
  if (res.data?.customerInfo?.email !== session.user.email) redirect("/");

  // Already seen — redirect permanently
  if (res.data.confirmationViewed) redirect(`/user/orders/${orderNumber}`);

  // First visit — mark it in DB before rendering
  await tokenizedFetch(`/api/order/${orderNumber}/mark-confirmation-viewed`, {
    method: "PATCH",
  });

  return <OrderConfirmedContents order={res.data} />;
}