/* THIS PAGE WILL BE OUR LANDING PAGE */


import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <>
      {/* NAVBAR section starts here */}
      {/* TODO:make navbar visible when user scrolls up even if the user did not react at the top of the page(with animation) */}

      <div className="navbar bg-background-500 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-accent-500 hover:shadow-none hover:bg-background-500 hover:border-background-500">Qrinyo</a>
        </div>
        <div className="flex-none">
          <Link href={"/log-in"}>
            <button className="btn btn-sm btn-outline border-primary-500 bg-primary-500 hover:bg-primary-600 hover:border-primary-600 mx-2">
              Log In
            </button>
          </Link>
          <Link href={"/sign-up"}>
            <button className="btn btn-sm btn-outline border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-background-500">
              <svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.14714 3.4904C4.76642 3.4904 3.64714 4.60969 3.64714 5.9904V14.3237C3.64714 15.7044 4.76642 16.8237 6.14714 16.8237H14.4805C15.8612 16.8237 16.9805 15.7044 16.9805 14.3237V10.9904C16.9805 10.5302 17.3536 10.1571 17.8138 10.1571C18.274 10.1571 18.6471 10.5302 18.6471 10.9904V14.3237C18.6471 16.6249 16.7817 18.4904 14.4805 18.4904H6.14714C3.84595 18.4904 1.98047 16.6249 1.98047 14.3237V5.9904C1.98047 3.68921 3.84595 1.82373 6.14714 1.82373H9.48047C9.94071 1.82373 10.3138 2.19683 10.3138 2.65706C10.3138 3.1173 9.94071 3.4904 9.48047 3.4904H6.14714Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M18.4031 2.06781C18.7285 2.39325 18.7285 2.92088 18.4031 3.24632L10.9031 10.7463C10.5776 11.0718 10.05 11.0718 9.72455 10.7463C9.39911 10.4209 9.39911 9.89325 9.72455 9.56781L17.2245 2.06781C17.55 1.74237 18.0776 1.74237 18.4031 2.06781Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M11.9805 2.65706C11.9805 2.19683 12.3536 1.82373 12.8138 1.82373H17.8138C18.274 1.82373 18.6471 2.19683 18.6471 2.65706V7.65706C18.6471 8.1173 18.274 8.4904 17.8138 8.4904C17.3536 8.4904 16.9805 8.1173 16.9805 7.65706V3.4904H12.8138C12.3536 3.4904 11.9805 3.1173 11.9805 2.65706Z" fill="currentColor" />
              </svg>
              Sign up
            </button>
          </Link>
        </div>
      </div>
      {/*NAVBAR section ends here*/}


      {/* First landing section with image STARTS here*/}

      <div className="flex flex-1 flex-col justify-baseline items-center bg-[url(../../public/images/landing_image.png)] bg-bottom bg-cover md:min-h-128 sm:min-h-128 px-4 sm:px-8 lg:px-16 py-8 sm:py-12 text-background-500">
        <div className="mx-4 mb-6 sm:mb-8 text-3xl sm:text-4xl lg:text-5xl font-bold sm:mx-8 lg:mx-16 text-center max-w-xs sm:max-w-md lg:max-w-3xl leading-tight">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
        <div className="mx-4 sm:mx-16 lg:mx-32 mb-8 sm:mb-12 font-normal text-background-200 text-center text-base sm:text-lg lg:text-xl max-w-sm sm:max-w-2xl lg:max-w-4xl leading-relaxed">Nulla mattis velit at magna tempus, ut rhoncus lorem cursus. Maecenas consequat, sapien eu iaculis finibus, risus nibh gravida eros, sit amet porta sapien magna at neque.</div>
        <button className="rounded-2xl btn btn-outline hover:bg-primary-600 hover:border-primary-600 text-base sm:text-lg font-medium">Get Started</button>
      </div>
      {/* First landing section with image ENDS here */}


      { /* Main Features part STARTS here  */}
      <div id="features_skeleton" className="flex flex-1 flex-col justify-center items-center">
        <div id="header" className="mx-4 mb-4 mt-4 sm:mt-10 text-3xl sm:text-4xl lg:text-5xl font-bold text-text-500 sm:mx-8 lg:mx-16 text-center max-w-xs sm:max-w-md lg:max-w-3xl leading-tight">Ana Özellikler</div>
        <div id="sub_header" className="mx-6 sm:mx-18 lg:mx-32 mb-8 sm:mb-12 font-normal text-text-400 text-center text-base sm:text-lg lg:text-xl max-w-sm sm:max-w-2xl lg:max-w-4xl leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris blandit nibh ac purus iaculis cursus. Donec pellentesque pellentesque turpis vitae hendrerit.</div>

        <div id="feature_cards" className="flex">
          <div className="card bg-base-100 w-96 shadow-sm">
            <figure className="px-10 pt-10">
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="Shoes"
                className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">Card Title</h2>
              <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
              <div className="card-actions">
                <button className="btn btn-primary">Buy Now</button>
              </div>
            </div>
          </div>
        </div>


      </div>
      { /* Main Features part STARTS here  */}


      <div className="min-h-screen bg-accent-200">ben cafer dayak yemeyi severim -FA</div>





    </>
  )

}
