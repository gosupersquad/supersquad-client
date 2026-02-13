export default function RefundsAndCancellationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-12">
          <h1 className="mb-3 text-center font-serif text-4xl font-medium text-gray-900 sm:text-5xl">
            Cancellation & Refund Policy
          </h1>
          <p className="mb-12 text-center font-sans text-sm text-gray-500">
            Last updated on 16-12-2024 12:53:09
          </p>

          <div className="space-y-8 font-sans">
            <p className="text-gray-700">
              ZIRECTLY TECHNOLOGIES PRIVATE LIMITED believes in helping its
              customers as far as possible, and has therefore a liberal
              cancellation policy. Under this policy:
            </p>

            <ul className="list-disc space-y-6 pl-6 text-gray-700">
              <li>
                Cancellations will be considered only if the request is made
                immediately after placing the order. However, the cancellation
                request may not be entertained if the orders have been
                communicated to the vendors/merchants and they have initiated
                the process of shipping them.
              </li>

              <li>
                ZIRECTLY TECHNOLOGIES PRIVATE LIMITED does not accept
                cancellation requests for perishable items like flowers,
                eatables etc. However, refund/replacement can be made if the
                customer establishes that the quality of product delivered is
                not good.
              </li>

              <li>
                In case of receipt of damaged or defective items please report
                the same to our Customer Service team. The request will,
                however, be entertained once the merchant has checked and
                determined the same at his own end. This should be reported
                within <span className="font-medium">2 Days</span> of receipt of
                the products. In case you feel that the product received is not
                as shown on the site or as per your expectations, you must bring
                it to the notice of our customer service within{" "}
                <span className="font-medium">2 Days</span> of receiving the
                product. The Customer Service Team after looking into your
                complaint will take an appropriate decision.
              </li>

              <li>
                In case of complaints regarding products that come with a
                warranty from manufacturers, please refer the issue to them. In
                case of any Refunds approved by the ZIRECTLY TECHNOLOGIES
                PRIVATE LIMITED, it&apos;ll take{" "}
                <span className="font-medium">3-5 Days</span> for the refund to
                be processed to the end customer.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
