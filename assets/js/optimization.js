/**
 * Optimization script for Lupi Racing website
 * Improves performance through lazy loading and other optimizations
 */

document.addEventListener('DOMContentLoaded', function () {
    // Lazy load images that are not in the viewport
    const placeholder =
        "data:image/svg+xml,%3Csvg%20xmlns%3D'http://www.w3.org/2000/svg'%20width%3D'1'%20height%3D'1'%20viewBox%3D'0%200%201%201'%3E%3Crect%20width%3D'1'%20height%3D'1'%20fill%3D'%23f4f4f4'%20/%3E%3C/svg%3E";
    // Include any image explicitly marked with data-src (e.g., updates/articles)
    // and also generic .img-fluid images for progressive enhancement
    const lazyImages = Array.from(
        document.querySelectorAll('img[data-src], img.img-fluid:not(.timeline-img):not(.testimonial-img)')
    );

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function (lazyImage) {
            // If the element already has data-src (e.g., created by content.js), keep it,
            // otherwise convert current src to data-src and use a lightweight placeholder
            if (!lazyImage.dataset.src) {
                lazyImage.dataset.src = lazyImage.src;
                lazyImage.src = placeholder;
            }
            imageObserver.observe(lazyImage);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        let lazyLoadThrottleTimeout;

        function lazyLoad() {
            if (lazyLoadThrottleTimeout) {
                clearTimeout(lazyLoadThrottleTimeout);
            }

            lazyLoadThrottleTimeout = setTimeout(function () {
                const scrollTop = window.pageYOffset;

                lazyImages.forEach(function (lazyImage) {
                    if (lazyImage.offsetTop < (window.innerHeight + scrollTop)) {
                        if (lazyImage.dataset.src) {
                            lazyImage.src = lazyImage.dataset.src;
                            lazyImage.removeAttribute('data-src');
                        }
                    }
                });

                if (lazyImages.length === 0) {
                    document.removeEventListener('scroll', lazyLoad);
                    window.removeEventListener('resize', lazyLoad);
                    window.removeEventListener('orientationChange', lazyLoad);
                }
            }, 20);
        }

        document.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
        window.addEventListener('orientationChange', lazyLoad);
    }

    // Optimize carousel transitions
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(function (carousel) {
        // Reduce initial load by pausing carousels until visible
        if (!isElementInViewport(carousel)) {
            const carouselInstance = bootstrap.Carousel.getInstance(carousel);
            if (carouselInstance) {
                carouselInstance.pause();
            }
        }
    });

    // Defer non-critical CSS
    const nonCriticalCSS = [
        'assets/vendor/remixicon/remixicon.css',
        'assets/vendor/boxicons/css/boxicons.min.css'
    ];

    nonCriticalCSS.forEach(function (stylesheetURL) {
        const stylesheet = document.querySelector(`link[href="${stylesheetURL}"]`);
        if (stylesheet) {
            stylesheet.setAttribute('media', 'print');
            stylesheet.setAttribute('onload', "this.media='all'");
        }
    });
    document.querySelectorAll('img:not([loading])').forEach(function (img) {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
    });
});

// Helper function to check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add event listener for page load to remove loader quickly
window.addEventListener('load', function () {
    document.body.classList.add('loaded');
    setTimeout(function () {
        const loader = document.getElementById('loader-wrapper');
        if (loader) {
            loader.style.display = 'none';
        }
    }, 500);
}); 