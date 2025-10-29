import Image from 'next/image';

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="card bg-gradient-to-b from-secondary-500/70 from-[88.94%] to-secondary-500/49 border border-primary-400 w-full max-w-xs h-full hover:-translate-y-2 transition-transform duration-200">
      <div className="card-body p-6 flex flex-col">
        {/* Icon container with white background */}
        <div className="bg-white rounded-2xl w-[70px] h-[70px] flex items-center justify-center mb-4">
          <Image 
            src={icon}
            alt={title}
            width={45}
            height={45}
            className="object-contain"
          />
        </div>
        
        {/* Title with fixed height to maintain consistent card heights */}
        <h3 className="card-title text-accent-500 text-2xl font-bold mb-2 self-center text-center min-h-[4rem]">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-accent-500 text-lg leading-normal flex-grow">
          {description}
        </p>
      </div>
    </div>
  );
}
