import Image from "next/image";

export default function PricingCard({ 
  title, 
  price, 
  period = "per user, per month", 
  features, 
  buttonText = "Start",
  highlighted = false,
  buttonStyle = "outline" // "outline" or "filled"
}) {
  return (
    <div className={`flex flex-col items-center w-full max-w-[336px] h-[550px] rounded-[20px] border border-[#dbdbdb] ${
      highlighted ? 'bg-secondary-500/80' : 'bg-background-500'
    } p-6 relative`}>
      {/* Title */}
      <h3 className={`font-bold text-2xl text-center mb-8 ${
        highlighted ? 'text-background-200' : 'text-text-500'
      }`}>
        {title}
      </h3>
      
      {/* Price */}
      <p className={`font-extrabold text-5xl text-center mb-2 ${
        highlighted ? 'text-background-500' : 'text-text-500'
      }`}>
        {price}
      </p>
      
      {/* Period */}
      <p className={`font-medium text-sm text-center mb-10 ${
        highlighted ? 'text-background-200' : 'text-text-400'
      }`}>
        {period}
      </p>
      
      {/* Button */}
      {buttonStyle === "filled" ? (
        <button className="bg-background-500 border-2 border-primary-500 text-text-500 font-semibold text-lg px-5 py-3 rounded-[14px] mb-12 hover:bg-primary-100/70 hover:text-text-700  w-[250px] transition hover:-translate-y-1 hover:scale-102 duration-300 ease-out">
          {buttonText}
        </button>
      ) : (
        <button className={`border-[3px] ${
          highlighted ? 'border-background-500/40 text-background-200' : 'border-text-500/20 text-text-400'
        } font-bold text-xl px-5 py-3 rounded-[10px] mb-12 hover:bg-background-600/40 hover:border-opacity-40 transition hover:-translate-y-1 hover:scale-102 duration-300 ease-out w-[250px]`}>
          {buttonText}
        </button>
      )}
      
      {/* Decorative line */}
      <div className="w-28 mb-7 relative h-0">
        <Image 
          src="/images/landing/pricing-line.svg" 
          alt="" 
          width={112} 
          height={1}
          className="w-full"
        />
      </div>
      
      {/* Features */}
      <div className="flex flex-col gap-3.5 items-center">
        {features.map((feature, index) => (
          <p 
            key={index} 
            className={`font-medium text-sm text-center ${
              highlighted ? 'text-background-200' : 'text-text-400'
            }`}
          >
            {feature}
          </p>
        ))}
      </div>
    </div>
  );
}
