import React, { useEffect, useRef, useState, useCallback } from 'react';

type ImageItem = {
  src: string;
  alt: string;
  caption?: string;
};

const IMMERSED_IMAGES: ImageItem[] = [
  { src: '/images/immersed/DSC_0082.JPG', alt: 'Immersed training discussion'},
  { src: '/images/immersed/DSC_0103.JPG', alt: 'Immersed training discussion 2'},
  { src: '/images/immersed/DSC_0105.JPG', alt: 'Immersed training discussion 3'},
  { src: '/images/immersed/DSC_0113.JPG', alt: 'Training session 1'},
  { src: '/images/immersed/DSC_0114.JPG', alt: 'Training session 2' },
  { src: '/images/immersed/DSC_0128.JPG', alt: 'Youths in the training session'},
  { src: '/images/immersed/DSC_0132.JPG', alt: 'Training session 3'},
  { src: '/images/immersed/DSC_0133.JPG', alt: 'Youths in the training session 2'},
  { src: '/images/immersed/DSC_0138.JPG', alt: 'Group photo after training session' },
  { src: '/images/immersed/DSC_0139.JPG', alt: 'Group photo after training session 2' },
  { src: '/images/immersed/DSC_0140.JPG', alt: 'Group photo after training session 3' },
  { src: '/images/immersed/DSC_0251.JPG', alt: 'Girl noting down points during training'},
  { src: '/images/immersed/IMG1.jpg', alt: 'Meeting with Kenyatta University Vice Chancellor' },
  { src: '/images/immersed/IMG2.jpg', alt: 'CEO giving speech' },
  { src: '/images/immersed/IMG3.jpg', alt: 'CEO and Kenyatta University Vice Chancellor' },
  { src: '/images/immersed/IMG4.jpg', alt: 'CEO in discussion' },
  { src: '/images/immersed/IMG5.jpg', alt: 'Team members group photo with the Kenyatta University Vice Chancellor' },
  { src: '/images/pwds/pwd1.jpg', alt: 'Persons with disbailities 1' },
  { src: '/images/pwds/pwd2.jpg', alt: 'Persons with disbailities 2' },
  { src: '/images/pwds/pwd3.jpg', alt: 'Persons with disbailities 3' },
  { src: '/images/pwds/pwd4.jpg', alt: 'Persons with disbailities 4' },
  { src: '/images/pwds/pwd5.jpg', alt: 'Persons with disbailities 5' },
];

const ImmersedGallery: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (openIndex === null) {
      document.body.style.overflow = '';
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
      return;
    }

    document.body.style.overflow = 'hidden';
    setTimeout(() => closeButtonRef.current?.focus(), 0);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowRight') setOpenIndex(i => (i === null ? 0 : (i + 1) % IMMERSED_IMAGES.length));
      if (e.key === 'ArrowLeft') setOpenIndex(i => (i === null ? IMMERSED_IMAGES.length - 1 : (i - 1 + IMMERSED_IMAGES.length) % IMMERSED_IMAGES.length));
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openIndex]);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 50) nextImage();
      if (diff < -50) prevImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }, []);

  const nextImage = useCallback(() => setOpenIndex(i => (i === null ? 0 : (i + 1) % IMMERSED_IMAGES.length)), []);
  const prevImage = useCallback(() => setOpenIndex(i => (i === null ? IMMERSED_IMAGES.length - 1 : (i - 1 + IMMERSED_IMAGES.length) % IMMERSED_IMAGES.length)), []);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {IMMERSED_IMAGES.map((img, idx) => (
          <button
            key={img.src}
            type="button"
            onClick={e => {
              lastFocusedRef.current = e.currentTarget;
              setOpenIndex(idx);
            }}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 bg-gradient-to-br from-gray-100 dark:from-gray-800 to-gray-200 dark:to-gray-900 transition-colors duration-300"
            aria-label={`Open image ${idx + 1}: ${img.alt}`}
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-transparent to-transparent dark:from-blue-800/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
           
            {/* Image */}
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoading(prev => ({ ...prev, [idx]: false }))}
            />
           
            {/* Caption overlay */}
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-semibold bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                <p className="line-clamp-2">{img.caption}</p>
              </div>
            )}
           
            {/* Expand icon */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${openIndex + 1} of ${IMMERSED_IMAGES.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setOpenIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative max-w-[95vw] max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-gray-900 dark:from-gray-800 to-black dark:to-gray-900 flex items-center justify-center animate-scale-in transition-colors duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={() => setOpenIndex(null)}
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-md hover:bg-white/20 dark:hover:bg-white/30 text-white transition-all duration-300 flex items-center justify-center shadow-xl hover:scale-110 group"
              aria-label="Close gallery"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous button */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-md hover:bg-white/20 dark:hover:bg-white/30 text-white transition-all duration-300 flex items-center justify-center shadow-xl hover:scale-110 group"
              aria-label="Previous image"
            >
              <svg className="w-7 h-7 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next button */}
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-md hover:bg-white/20 dark:hover:bg-white/30 text-white transition-all duration-300 flex items-center justify-center shadow-xl hover:scale-110 group"
              aria-label="Next image"
            >
              <svg className="w-7 h-7 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Main image */}
            <img
              src={IMMERSED_IMAGES[openIndex].src}
              alt={IMMERSED_IMAGES[openIndex].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl transition-all duration-500 ease-in-out"
            />

            {/* Caption */}
            {IMMERSED_IMAGES[openIndex].caption && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 dark:bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 max-w-[90%]">
                <p className="text-white text-center font-semibold">{IMMERSED_IMAGES[openIndex].caption}</p>
              </div>
            )}

            {/* Navigation dots */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {IMMERSED_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setOpenIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === openIndex
                      ? 'w-8 h-2 bg-blue-500'
                      : 'w-2 h-2 bg-white/40 dark:bg-white/60 hover:bg-white/60 dark:hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>

            {/* Image counter */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 dark:bg-white/20 backdrop-blur-md rounded-full text-white font-semibold text-sm shadow-xl">
              {openIndex + 1} / {IMMERSED_IMAGES.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImmersedGallery;