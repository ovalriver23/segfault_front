import Image from "next/image";

export default function StepCard({ stepNumber, title, description, middleCircleVariant }) {
  return (
    <div className="flex flex-col items-center w-60 md:w-64 lg:w-72">
      {/* Step indicator circles */}
      <div className="relative w-60 h-60 mb-8">
        {/* Outer circle */}
        <div className="absolute left-2.5 top-0 w-60 h-60">
          <Image 
            src="/images/landing/step-circle-outer.svg" 
            alt="" 
            width={240} 
            height={240}
            className="w-full h-full"
          />
        </div>
        
        {/* Middle circle - different color for each step */}
        <div className="absolute left-[26px] top-4 w-52 h-52">
          <Image 
            src={`/images/landing/step-circle-middle-${middleCircleVariant}.svg`}
            alt="" 
            width={208} 
            height={208}
            className="w-full h-full"
          />
        </div>
        
        {/* Inner circle */}
        <div className="absolute left-[54px] top-11 w-38 h-38">
          <Image 
            src="/images/landing/step-circle-inner.svg" 
            alt="" 
            width={152} 
            height={152}
            className="w-full h-full"
          />
        </div>
        
        {/* Right dot */}
        <div className="absolute right-0 top-[109px] w-[21px] h-[21px]">
          <Image 
            src="/images/landing/step-circle-dot.svg" 
            alt="" 
            width={21} 
            height={21}
            className="w-full h-full"
          />
        </div>
        
        {/* Left dot */}
        <div className="absolute left-0 top-[109px] w-[21px] h-[21px]">
          <Image 
            src="/images/landing/step-circle-dot.svg" 
            alt="" 
            width={21} 
            height={21}
            className="w-full h-full"
          />
        </div>
        
        {/* Step number and label */}
        <div className="absolute left-[130px] top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-center">
          <p className="font-bold text-[44px] text-[#2e2e2e] leading-none">
            {stepNumber.toString().padStart(2, '0')}
          </p>
          <p className="font-medium text-[20px] text-[#2e2e2e] uppercase leading-none">
            ADIM
          </p>
        </div>
      </div>
      
      {/* Text content */}
      <div className="flex flex-col gap-6 items-center text-center">
        <h3 className="font-bold text-2xl text-text-500/85">
          {title}
        </h3>
        <p className="font-medium text-lg text-text-500 leading-6 max-w-[260px]">
          {description}
        </p>
      </div>
    </div>
  );
}
