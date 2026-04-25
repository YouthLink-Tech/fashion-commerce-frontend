import Link from "next/link";
import { Checkbox } from "@nextui-org/react";

export default function CheckoutAgreement({
  isAgreementCheckboxSelected,
  setIsAgreementCheckboxSelected,
  legalPolicyPdfLinks,
}) {
  return (
    <div
      className={`flex gap-x-2 [&_a]:underline [&_a]:underline-offset-2 [&_span]:text-xs lg:[&_span]:text-[13px] ${isAgreementCheckboxSelected ? "[&_a]:text-[var(--color-primary-900)]" : "[&_a]:text-[#f31260]"}`}
    >
      <Checkbox
        className="[&_span::after]:rounded-[3px] [&_span::before]:rounded-[3px] [&_span:has(svg):after]:bg-[var(--color-primary-500)] [&_span:has(svg)]:text-neutral-700 [&_span]:rounded-[3px]"
        // radius="sm"
        defaultSelected
        isRequired
        isSelected={isAgreementCheckboxSelected}
        onValueChange={setIsAgreementCheckboxSelected}
        isInvalid={!isAgreementCheckboxSelected}
      >
        I have read and agree to the{" "}
        <Link target="_blank" rel="noopener noreferrer" href={legalPolicyPdfLinks[0]?.terms?.url || "#"}>
          terms and conditions
        </Link>
        ,{" "}
        <Link target="_blank" rel="noopener noreferrer" href={legalPolicyPdfLinks[0]?.privacy?.url || "#"}>
          privacy policy
        </Link>
        ,{" "}
        <Link target="_blank" rel="noopener noreferrer" href={legalPolicyPdfLinks[0]?.shipping?.url || "#"}>
          shipping policy
        </Link>
        , and{" "}
        <Link target="_blank" rel="noopener noreferrer" href={legalPolicyPdfLinks[0]?.refund?.url || "#"}>
          refund policy
        </Link>
        .
      </Checkbox>
    </div>
  );
}
