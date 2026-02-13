export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-12">
          <h1 className="mb-3 text-center font-serif text-4xl font-medium text-gray-900 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mb-12 text-center font-sans text-sm text-gray-500">
            Last updated on 16-12-2024 12:52:00
          </p>

          <p className="mb-12 text-center font-sans text-lg text-gray-700">
            You may contact us using the information below:
          </p>

          <div className="space-y-8 sm:space-y-12">
            <div className="text-center">
              <h2 className="mb-3 font-serif text-xl text-gray-900 sm:text-2xl">
                Merchant Legal Entity Name
              </h2>
              <p className="font-sans text-gray-700">
                ZIRECTLY TECHNOLOGIES PRIVATE LIMITED
              </p>
            </div>

            <div className="text-center">
              <h2 className="mb-3 font-serif text-xl text-gray-900 sm:text-2xl">
                Registered Address
              </h2>
              <p className="font-sans text-gray-700">
                704 7TH FLOOR, PALM COURT, MG ROAD,
                <br />
                GURUGRAM, Haryana, PIN: 122007
              </p>
            </div>

            <div className="text-center">
              <h2 className="mb-3 font-serif text-xl text-gray-900 sm:text-2xl">
                Operational Address
              </h2>
              <p className="font-sans text-gray-700">
                704 7TH FLOOR, PALM COURT, MG ROAD,
                <br />
                GURUGRAM, Haryana, PIN: 122007
              </p>
            </div>

            <div className="text-center">
              <h2 className="mb-3 font-serif text-xl text-gray-900 sm:text-2xl">
                Contact Details
              </h2>
              <div className="space-y-2">
                <p className="font-sans">
                  <span className="text-gray-600">Telephone: </span>
                  <a
                    href="tel:+918930700021"
                    className="text-blue-600 transition-colors duration-200 hover:text-blue-800"
                  >
                    +91 89307 00021
                  </a>
                </p>
                <p className="font-sans">
                  <span className="text-gray-600">Email: </span>
                  <a
                    href="mailto:akash@gosupersquad.com"
                    className="text-blue-600 transition-colors duration-200 hover:text-blue-800"
                  >
                    akash@gosupersquad.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
