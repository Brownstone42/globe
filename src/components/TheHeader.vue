<template>
    <div class="app-container">
        <div class="sub-header" ref="subHeader">
            <!-- Desktop Layout (visible when not mobile) -->
            <!-- This container will hold the original content only for desktop display -->
            <div v-if="!isMobile" class="is-flex is-justify-content-space-between is-align-items-center sub-header-desktop-content">
                <div class="is-flex is-align-items-center sub-header-group">
                    <label class="sub-header-label">
                        <i class="fas fa-mobile-alt sub-header-icon"></i> Sales : 089-999-9999
                    </label>
                    <label class="sub-header-label">
                        <i class="fas fa-phone sub-header-icon"></i> Office : 02-222-2222
                    </label>
                    <label class="sub-header-label">
                        <i class="fas fa-envelope sub-header-icon"></i> admin@idealglobe.com
                    </label>
                </div>
                <div class="is-flex is-align-items-center sub-header-group sub-header-right-group">
                    <label class="sub-header-label">ผู้นำด้านอุปกรณ์ Cleanroom และ ESD ครบวงจร</label>
                </div>
            </div>

            <!-- Mobile Looping Layout (visible when mobile) -->
            <!-- This container holds original + duplicated content for seamless scrolling -->
            <!-- **THIS IS THE CRUCIAL 'scrolling-content' WRAPPER** -->
            <div v-if="isMobile" class="scrolling-content">
                <!-- Original Left Group -->
                <div class="is-flex is-align-items-center sub-header-group">
                    <label class="sub-header-label">
                        <i class="fas fa-mobile-alt sub-header-icon"></i> Sales : 089-999-9999
                    </label>
                    <label class="sub-header-label">
                        <i class="fas fa-phone sub-header-icon"></i> Office : 02-222-2222
                    </label>
                    <label class="sub-header-label">
                        <i class="fas fa-envelope sub-header-icon"></i> admin@idealglobe.com
                    </label>
                </div>

                <!-- Original Right Group -->
                <div class="is-flex is-align-items-center sub-header-group sub-header-right-group">
                    <label class="sub-header-label">ผู้นำด้านอุปกรณ์ Cleanroom และ ESD ครบวงจร</label>
                </div>

                <!-- DUPLICATED CONTENT FOR SEAMLESS LOOPING -->
                <div class="is-flex is-align-items-center sub-header-group">
                    <label class="sub-header-label">
                        <i class="fas fa-mobile-alt sub-header-icon"></i> Sales : 089-999-9999
                    </label>
                    <label class="sub-header-label">
                        <i class="fas fa-phone sub-header-icon"></i> Office : 02-222-2222
                    </label>
                    <label class="sub-header-label">
                        <i class="fas fa-envelope sub-header-icon"></i> admin@idealglobe.com
                    </label>
                </div>

                <div class="is-flex is-align-items-center sub-header-group sub-header-right-group">
                    <label class="sub-header-label">ผู้นำด้านอุปกรณ์ Cleanroom && ESD ครบวงจร</label>
                </div>
            </div>
        </div>
        <div class="header">
            <img src="/images/logo.png" alt="Company Logo" class="header-logo">
        </div>
    </div>
</template>

<script>
export default {
    props: {
        page: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isMobile: false, // Reactive property to track screen size
            animationFrameId: null // To store the requestAnimationFrame ID for cleanup
        };
    },
    methods: {
        checkScreenSize() {
            this.isMobile = window.innerWidth < 1000;
        },
        startScrollLoop() {
            // Ensure any previous loop is stopped before starting a new one
            this.stopScrollLoop();

            const subHeader = this.$refs.subHeader;
            if (!subHeader) return;

            // Use nextTick to ensure DOM is fully updated after v-if renders content
            this.$nextTick(() => {
                const scrollingContent = subHeader.querySelector('.scrolling-content');
                // **IMPORTANT**: Check if scrollingContent exists after nextTick
                if (!scrollingContent) {
                    console.warn("'.scrolling-content' not found. Is v-if='isMobile' working correctly?");
                    return;
                }

                // Calculate the width of one full set of content (original groups).
                // This is the point at which we'll reset the scroll for a seamless loop.
                const contentWidth = scrollingContent.scrollWidth / 2; // Half of the total width of duplicated content
                const visibleWidth = subHeader.clientWidth;

                // Only proceed if the content actually overflows the visible area
                if (contentWidth <= visibleWidth) {
                    return; // Content fits, no need for looping scroll
                }

                let lastTime;
                const scrollSpeed = 50; // Pixels per second, adjust as needed for speed

                const loopScroll = (currentTime) => {
                    if (!lastTime) lastTime = currentTime;
                    const deltaTime = currentTime - lastTime; // Time elapsed since last frame
                    lastTime = currentTime;

                    // Calculate how much to scroll based on time and speed
                    const scrollAmount = (scrollSpeed / 1000) * deltaTime;

                    // Increment scrollLeft to move content from right to left
                    subHeader.scrollLeft += scrollAmount;

                    // If we've scrolled past the first set of content, reset to the beginning
                    // This creates the seamless looping effect
                    if (subHeader.scrollLeft >= contentWidth) {
                        subHeader.scrollLeft = 0; // Reset to the beginning
                    }

                    this.animationFrameId = requestAnimationFrame(loopScroll); // Continue the loop
                };

                // Start the animation after a very short initial delay
                setTimeout(() => {
                    this.animationFrameId = requestAnimationFrame(loopScroll);
                }, 100);
            });
        },
        stopScrollLoop() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    },
    watch: {
        isMobile(newVal) {
            if (newVal) {
                // If switching to mobile, start the loop
                this.startScrollLoop();
            } else {
                // If switching to desktop, stop the loop and reset scroll
                this.stopScrollLoop();
                if (this.$refs.subHeader) {
                    this.$refs.subHeader.scrollLeft = 0; // Ensure it's at the start for desktop
                }
            }
        }
    },
    mounted() {
        this.checkScreenSize(); // Initial check when component mounts
        // Add event listener for window resize to update isMobile
        window.addEventListener('resize', this.checkScreenSize);
    },
    beforeUnmount() {
        // Remove event listener to prevent memory leaks
        window.removeEventListener('resize', this.checkScreenSize);
        // Stop the animation loop if it's running when the component is destroyed
        this.stopScrollLoop();
    }
}
</script>

<style scoped>
/* .app-container font-family and font-weight removed as default body font is set globally */

.header {
    display: flex;
    position: sticky;
    z-index: 10;
    height: 100px;
    background: linear-gradient(to top, #216E74, #2B8489, #3CABAE);
    justify-content: center;
    align-items: center;
}
.header-logo {
    max-height: 60px;
    width: auto;
}

.sub-header {
    display: flex;
    position: sticky;
    z-index: 10;
    height: 30px;
    background-color: black;
    color: white;
    align-items: center;
    padding: 0 10px; /* Added padding to prevent labels from touching edges */
    
    /* Hide scrollbar for different browsers */
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    overflow-x: hidden; /* Default to hidden, will be overridden by mobile styles */
}

/* For Webkit browsers (Chrome, Safari) */
.sub-header::-webkit-scrollbar {
    display: none; /* Hide scrollbar */
}

/* Flex groups within sub-header */
.sub-header-group {
    display: flex;
    align-items: center;
    gap: 20px; /* Spacing between labels within a group */
    flex-shrink: 0; /* Prevent groups from shrinking */
}

/* Styles for labels within sub-header */
.sub-header-label {
    white-space: nowrap; /* Prevent individual labels from wrapping */
}

/* Style for icons within the sub-header */
.sub-header-icon {
    width: 24px; /* Adjust as needed */
    height: 24px; /* Adjust as needed */
    font-size: 14px; /* Adjust icon size relative to container */
    border: 1px solid white; /* White border */
    border-radius: 50%; /* Make it circular */
    display: inline-flex; /* Use flexbox for centering */
    justify-content: center;
    align-items: center;
    margin-right: 8px; /* Space between icon and label text */
}

/* Desktop-specific styles for the sub-header content */
.sub-header-desktop-content {
    width: 100%; /* Take full width of sub-header */
    /* Ensure it behaves like a flex container for its children */
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Container for the scrolling content (only visible on mobile) */
.scrolling-content {
    display: flex;
    align-items: center;
    white-space: nowrap; /* Ensures all content stays on a single line for scrolling */
    
    /* Crucial: Set a min-width that is guaranteed to be larger than the viewport
       to force overflow and enable scrolling. Adjust this value based on your content's
       actual rendered width + desired spacing. For a 1000px breakpoint, something
       like 1500px or 1800px is usually needed to ensure overflow. */
    min-width: 1500px; /* Increased min-width to ensure overflow */
    
    /* Add a consistent gap between all groups within the scrolling content on mobile */
    /* This ensures a minimum separation between the original and duplicated sets */
    gap: 150px; /* Adjust this value to control the minimum gap between groups */
}

/* Mobile-specific styles */
@media (max-width: 999px) {
    .sub-header {
        overflow-x: auto; /* Enable horizontal scrolling only on mobile */
        justify-content: flex-start; /* Align content to the start for scrolling */
        white-space: normal; /* Reset white-space for .sub-header itself */
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    }
}
</style>
