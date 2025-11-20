import React, { useState } from 'react';

interface PlanProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  isPrimary: boolean;
}

const PricingCard: React.FC<PlanProps> = ({ name, price, period = "/month", features, isPrimary }) => {
  const [buttonText, setButtonText] = useState("Get Started");

  const handleCtaClick = () => {
    setButtonText("Request Sent! ✓");
    setTimeout(() => setButtonText("Get Started"), 3000);
  };

  const showPeriod = price && !/contact/i.test(price);

  return (
    <div
      className={`
        relative flex flex-col p-8 rounded-3xl transition-all duration-500 transform overflow-hidden
        hover:-translate-y-2 hover:shadow-2xl border-2
        ${isPrimary
          ? 'bg-blue-900 dark:bg-blue-800 text-white scale-105 z-10 border-blue-500 shadow-xl'
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
        }
      `}
      role="region"
      aria-label={`${name} plan`}
    >
      {/* Recommended badge */}
      {isPrimary && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl rounded-tr-3xl shadow-lg z-20">
          POPULAR
        </div>
      )}
     
      <div className="flex-1">
        {/* Plan name */}
        <h3 className={`text-2xl font-bold mb-2 ${isPrimary ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {name}
        </h3>
       
        {/* Subtitle */}
        <p className={`mb-6 text-sm ${isPrimary ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {name.includes('Enterprise') ? 'For large organizations' : 
           name.includes('Business') ? 'For growing hospitals' : 
           name.includes('Standard') ? 'For medium clinics' : 'Perfect for small clinics'}
        </p>

        {/* Price */}
        <div className="mb-8">
          <p className="text-4xl font-bold">
            {price}
            {showPeriod && (
              <span className={`text-lg font-medium ${isPrimary ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                {period}
              </span>
            )}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5
                ${isPrimary
                  ? 'bg-white/20'
                  : 'bg-blue-100 dark:bg-blue-900/30'
                }
              `}>
                <svg
                  className={`w-3 h-3 ${isPrimary ? 'text-white' : 'text-blue-800 dark:text-blue-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className={`text-sm leading-relaxed ${isPrimary ? 'text-blue-50' : 'text-gray-700 dark:text-gray-300'}`}>
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
          w-full py-3 rounded-xl font-semibold transition-all duration-300
          ${isPrimary
            ? 'bg-white text-blue-900 hover:bg-blue-50 shadow-lg hover:shadow-xl'
            : 'bg-blue-800 hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default PricingCard;