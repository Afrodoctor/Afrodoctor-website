import React, { useState } from 'react';

interface PlanProps {
  name: string;
  price: string;
  period?: string; //period prop to handle '/year' vs '/month'
  features: string[];
  isPrimary: boolean;
}

const PricingCard: React.FC<PlanProps> = ({ name, price, period = "/month", features, isPrimary }) => {
  const [buttonText, setButtonText] = useState("Get Started");
  const [isHovered, setIsHovered] = useState(false);

  const handleCtaClick = () => {
    setButtonText("Request Sent! ✓");
    // In a real app, this would trigger a form or API call
    setTimeout(() => setButtonText("Get Started"), 3000);
  };

  // Only show the period (e.g., /year) if it's a price and not text like "Contact"
  const showPeriod = price && !/contact/i.test(price);

  return (
    <div
      className={`
        relative flex flex-col p-8 rounded-3xl transition-all duration-500 transform overflow-hidden
        hover:-translate-y-2 hover:shadow-2xl border border-gray-200 dark:border-gray-700
        ${isPrimary
          ? 'bg-blue-900 dark:bg-blue-800 text-white scale-105 z-10 border-2 border-blue-400 dark:border-blue-500 shadow-xl'
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label={`${name} plan`}
    >
      {/* Animated background overlay */}
      {isPrimary && (
        <div className="absolute inset-0 bg-blue-800 dark:bg-blue-700 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      )}
     
      {/* Recommended badge */}
      {isPrimary && (
        <div className="absolute top-0 right-0 bg-yellow-500 dark:bg-yellow-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl rounded-tr-3xl shadow-lg">
          POPULAR
        </div>
      )}
     
      <div className="relative z-10 flex-1">
        {/* Plan name */}
        <h3 className={`text-2xl md:text-3xl font-extrabold mb-2 ${isPrimary ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {name}
        </h3>
       
        {/* Subtitle based on plan type */}
        <p className={`mb-6 text-sm ${isPrimary ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {name.includes('Enterprise') ? 'For large organizations' : name.includes('Business') ? 'For growing hospitals' : 'Perfect for clinics'}
        </p>

        {/* Price */}
        <div className="mb-8">
          <p className="text-4xl md:text-5xl font-extrabold" aria-hidden={false}>
            {price}
            {showPeriod && (
              <span className={`text-lg font-medium ${isPrimary ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{period}</span>
            )}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-4 mb-10">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start group/feature">
              <div className={`
                flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 transition-all duration-300
                ${isPrimary
                  ? 'bg-white/20 dark:bg-white/30 group-hover/feature:bg-white/30 dark:group-hover/feature:bg-white/40'
                  : 'bg-blue-100 dark:bg-blue-900/30 group-hover/feature:bg-blue-200 dark:group-hover/feature:bg-blue-800/50'
                }
              `}>
                <svg
                  className={`w-3 h-3 md:w-4 md:h-4 ${isPrimary ? 'text-white' : 'text-blue-800 dark:text-blue-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className={`text-sm md:text-base leading-relaxed transition-all duration-300 ${isPrimary ? 'text-blue-50 group-hover/feature:text-white' : 'text-gray-700 dark:text-gray-300 group-hover/feature:text-gray-900 dark:group-hover/feature:text-white'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleCtaClick}
        className={`
          relative z-10 w-full py-4 rounded-xl font-bold transition-all duration-300 transform overflow-hidden
          ${isPrimary
            ? 'bg-white dark:bg-gray-100 text-blue-900 dark:text-blue-800 hover:bg-blue-100 dark:hover:bg-gray-200 shadow-xl hover:shadow-2xl hover:scale-105'
            : 'bg-blue-800 hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'
          }
        `}
        aria-label={`Select ${name} plan`}
      >
        <span className="relative z-10">{buttonText}</span>
        {isHovered && !isPrimary && (
          <span className="absolute inset-0 bg-blue-900 dark:bg-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        )}
      </button>
    </div>
  );
};

export default PricingCard;