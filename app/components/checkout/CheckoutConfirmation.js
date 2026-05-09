import Image from "next/image";
import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Confetti from "react-confetti";
import orderConfirmationCartImg from "@/public/confirmation/order-confirmation-cart.svg";
import orderConfirmationShippingImg from "@/public/confirmation/order-confirmation-shipping.svg";
import squigglyShape from "@/public/shapes/squiggly.png";
import arrowShape from "@/public/shapes/arrow.png";
import TransitionLink from "@/app/components/ui/TransitionLink";

export default function CheckoutConfirmation({
  orderDetails,
}) {
  const [showConeftti, setShowConeftti] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const fullAddress = [
    orderDetails?.address1?.trim(),
    orderDetails?.thana?.trim(),
    orderDetails?.city?.trim(),
    orderDetails?.postalCode?.trim()
  ].filter(Boolean).join(", ");

  useEffect(() => {
    setShowConeftti(true);
    const confettiTimer = setTimeout(() => setShowConeftti(false), 7500);

    return () => clearTimeout(confettiTimer);
  }, []);

  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <main className="pt-header-h-full-section-pb relative flex min-w-full items-center justify-center overflow-hidden bg-white px-5 pb-[var(--section-padding)] text-sm text-neutral-500 sm:px-8 md:text-base lg:px-12 xl:mx-auto xl:min-h-svh xl:max-w-[1200px] xl:px-0 [&_:is(h2,h3)]:text-neutral-800">
      {/* Confetti */}
      <Confetti
        className="absolute inset-0 h-full w-full"
        numberOfPieces={showConeftti ? 300 : 0}
        recycle={true}
        width={size.width} height={size.height}
      />
      {/* Mesh Gradients */}
      <div>
        <div className="absolute left-[10%] top-[40%] h-[150px] w-[150px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-static-bubble-secondary)] blur-[60px] md:left-[20%] md:blur-[40px] lg:top-[30%] xl:h-[187px] xl:w-[214px]" />
        <div className="absolute left-[60%] top-[20%] h-[150px] w-[150px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-static-bubble-primary)] blur-[60px] md:blur-[40px] xl:h-[187px] xl:w-[214px]" />
        <div className="absolute -right-4 bottom-4 h-[150px] w-[150px] rounded-full bg-[var(--color-static-bubble-secondary)] blur-[60px] md:blur-[40px] xl:h-[187px] xl:w-[214px]" />
      </div>
      {/* Side Image 1 */}
      <div className="absolute -left-[30%] bottom-0 aspect-square h-[60vh] -translate-x-1/4 translate-y-[7.5%] opacity-60 max-lg:hidden xl:left-0 xl:-scale-x-100">
        <Image
          className="h-full w-full object-contain"
          src={orderConfirmationCartImg}
          alt="Side image displaying order confirmation cart"
        />
      </div>
      {/* Side Image 2 */}
      <div className="absolute -right-[30%] top-0 aspect-square h-[60vh] translate-x-1/4 translate-y-[15%] opacity-60 max-lg:hidden xl:right-0">
        <Image
          className="h-full w-full object-contain"
          src={orderConfirmationShippingImg}
          alt="Side image displaying order confirmation shipping"
        />
      </div>
      {/* Squiggly Shape */}
      <div className="absolute left-1/4 top-3 aspect-square h-20 -translate-x-full translate-y-[150%] opacity-60 max-sm:hidden lg:top-16">
        <Image src={squigglyShape} alt="Squiggly shape" />
      </div>
      {/* Arrow Shape */}
      <div className="absolute bottom-3 right-1/4 aspect-square h-20 -translate-y-[40%] translate-x-full opacity-60 max-sm:hidden md:-translate-y-[20%] lg:bottom-16 lg:-translate-y-[150%]">
        <Image src={arrowShape} alt="Arrow shape" />
      </div>
      {/* Party Popper Lottie */}
      <div className="relative text-center [&>*]:mx-auto [&>*]:w-fit">
        <DotLottieReact
          className="-mt-8 h-32 object-contain"
          src="/confirmation/party-popper.lottie"
          loop
          autoplay
        />
        {/* Heading */}
        <h2 className="mt-2 text-2xl font-semibold">
          Thank you for your purchase!
        </h2>
        {/* Subheading */}
        <p className="mt-2 max-w-md text-sm">
          Upon confirmation, you will get an email! We are getting your order
          ready to be shipped. We will notify you when it has been sent.
        </p>
        {/* Order Details Section */}
        <section className="mt-10 max-w-[500px] space-y-3 rounded-[4px] border-2 border-neutral-200 p-3 text-sm sm:px-7 sm:py-5 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:text-left [&_h4]:font-semibold [&_h4]:text-neutral-600 sm:[&_h4]:text-nowrap [&_p]:text-right">
          <h3 className="text-center text-lg font-semibold">Order Details</h3>
          {/* Order Number */}
          <div>
            <h4>Order Number</h4>
            <p>#{orderDetails.orderNumber}</p>
          </div>
          {/* Phone Number */}
          <div>
            <h4>Phone Number</h4>
            <p>{orderDetails.phoneNumber}</p>
          </div>
          {/* Order Amount */}
          <div>
            <h4>Order Amount</h4>
            <p>৳ {orderDetails.totalAmount.toLocaleString()}</p>
          </div>
          {/* Shipping Details */}
          <div>
            <h4>Shipping Address</h4>
            <p>{fullAddress}</p>
          </div>
        </section>
        {/* CTA buttons */}
        <div className="mt-9 flex gap-x-2.5">
          <TransitionLink
            href="/shop"
            className="block rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-center text-sm font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
          >
            Continue Shopping
          </TransitionLink>
          <TransitionLink
            href={`/user/orders?order=${orderDetails.orderNumber}`}
            className="block rounded-[4px] bg-[var(--color-secondary-500)] px-4 py-2.5 text-center text-sm font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-secondary-600)]"
          >
            Track Order
          </TransitionLink>
        </div>
      </div>
    </main>
  );
}
