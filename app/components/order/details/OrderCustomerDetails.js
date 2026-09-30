export default function OrderCustomerDetails({ order, user }) {

  const customerName = order?.customer?.name || user?.name || "--";
  const email = order?.customer?.email || user?.email || "";

  const [emailUser, emailDomain] =
    email && email.includes("@") ? email.split("@") : [email || "--", null];

  return (
    <div className="mb-4 h-fit w-full rounded-[4px] border-2 border-neutral-200 p-3.5 text-sm xl:p-5">
      <h2 className="mb-3 text-sm font-semibold md:text-base">
        Customer Details
      </h2>
      <div className="space-y-1 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:font-semibold sm:[&_h4]:text-nowrap">
        <div>
          <h4>Name</h4>
          <p className="text-right">{customerName}</p>
        </div>
        <div>
          <h4>Email Address</h4>
          {emailDomain ? (
            <p className="flex flex-wrap justify-end text-right break-all max-sm:flex-col">
              <span>{emailUser}</span>
              <span>@{emailDomain}</span>
            </p>
          ) : (
            <p className="text-right">{email || "--"}</p>
          )}
        </div>
        <div>
          <h4>Phone Number</h4>
          <p className="text-right">{order?.phone_number || "--"}</p>
        </div>
        {!!order?.phone_number_2 && (
          <div>
            <h4>Alt. Phone Number</h4>
            <p className="text-right">{order?.phone_number_2}</p>
          </div>
        )}
      </div>
    </div>
  );
}
