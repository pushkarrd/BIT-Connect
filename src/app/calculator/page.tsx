import type { Metadata } from "next";
import CGPACalculator from "./cgpa";

export const metadata: Metadata = {
  title: "SEE Grade Calculator — BIT Connect",
  description:
    "Calculate the SEE exam marks you need to achieve your desired VTU grade. Enter your CIE marks and find out instantly.",
};

export default function CalculatorPage() {
  return <CGPACalculator />;
}
