import { Controller } from '@hotwired/stimulus'
import { Tooltip } from "bootstrap"
import { Popover } from "bootstrap"

export default class extends Controller {
    // Define targets for the controller
    static targets = ["overlay", "explanation"];

    // Define values with types and defaults
    static values = {
        timeout: {type: Number, default: 1000}
    }

    /**
     * Initializes the controller when connected to the DOM
     * Sets up initial state, event listeners, and starts the onboarding process
     */
    connect() {
        document.body.append(this.styles)

        this.coordinates = [];
        this.currentPopover = null;
        this.currentExplanation = 0;
        this.totalSteps = this.explanationTargets.length;
        this.demoButton = document.getElementById('onboardingDemoStarter');

        if (this.totalSteps <= this.currentExplanation) return;

        // Configure custom allowlist for Bootstrap Popover
        this.myCustomAllowList = {
            ...Tooltip.Default.allowList,
            div: ['class'],
            h1: [],
            p: [],
            button: ['class'],
            '*': ['class']
        };

        // Set up demo button or start onboarding automatically
        if (this.demoButton) {
            this.demoButton.addEventListener('click', () => {
                this.initializeCoordinates();
                this.currentExplanation = -1;
                this.nextExplanation();
            });
        } else {
            setTimeout(() => {
                this.initializeCoordinates();
                this.showExplanation(this.currentExplanation);
            }, this.timeoutValue);
        }
    }

    /**
     * Calculates and stores the coordinates of each target element
     * These coordinates are used for positioning the overlay and popover
     */
    initializeCoordinates() {
        this.explanationTargets.forEach((target, _index) => {
            const explainThis = document.getElementById(target.dataset.targetElement);
            const rect = explainThis.getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            this.coordinates.push({
                top: rect.top + scrollTop - 5,
                left: rect.left + scrollLeft - 5,
                width: rect.width + 10,
                height: rect.height + 10,
                explanation: target
            });
        });
    }

    /**
     * Returns the configuration object for Bootstrap Popover
     * @returns {Object} Popover configuration
     */
    popoverConfig() {
        return {
            trigger: 'manual',
            customClass: 'onboard-popover',
            html: true,
            placement: 'auto',
            container: 'body',
            allowList: this.myCustomAllowList
        };
    }

    /**
     * Disposes of the current Popover instance if it exists
     */
    disposeCurrentPopover() {
        if (this.currentPopover) {
            this.currentPopover.dispose();
            this.currentPopover = null;
        }
    }

    /**
     * Navigates to the previous explanation step
     */
    previousExplanation() {
        if (this.currentExplanation <= 0) return;

        this.currentExplanation -= 1;
        this.showExplanation();
    }

    /**
     * Navigates to the next explanation step
     * Hides onboarding if at the last step
     */
    nextExplanation() {
        if (this.currentExplanation >= this.coordinates.length - 1) this.hideOnboarding();

        this.currentExplanation += 1;
        this.showExplanation();
    }

    /**
     * Displays the current step's explanation
     * Positions the overlay, creates and shows the Popover
     */
    showExplanation() {
        this.disposeCurrentPopover();

        if (this.currentExplanation <= this.coordinates.length) {
            const matchingCoordinate = this.coordinates[this.currentExplanation];
            this.overlayTarget.classList.add('active');
            this.overlayTarget.style.top = `${matchingCoordinate.top}px`;
            this.overlayTarget.style.left = `${matchingCoordinate.left}px`;
            this.overlayTarget.style.width = `${matchingCoordinate.width}px`;
            this.overlayTarget.style.height = `${matchingCoordinate.height}px`;
            this.content = matchingCoordinate.explanation.innerHTML;
            this.overlayTarget.dataset.bsContent = this.populatedTemplate;

            // Create a MutationObserver to watch for when the popover is added to the DOM
            const observer = new MutationObserver((mutations, obs) => {
                const popover = document.querySelector('.onboard-popover');
                if (popover) {
                    this.bindPopoverEvents();
                    obs.disconnect(); // Stop observing once we've found the popover
                }
            });

            // Start observing the document with the configured parameters
            observer.observe(document.body, {childList: true, subtree: true});

            setTimeout(() => {
                this.currentPopover = new Popover(this.overlayTarget, this.popoverConfig());
                this.currentPopover.show();
                // TODO: only scroll when intersecting
                this.overlayTarget.scrollIntoView(true);
            }, 300);
        } else {
            this.overlayTarget.classList.remove('active');
            console.error(`No matching explanation found for step: ${this.currentExplanation}`);
        }
    }

    /**
     * Hides the onboarding overlay and disposes of the current Popover
     */
    hideOnboarding() {
        this.disposeCurrentPopover();
        this.overlayTarget.classList.remove('active');
        this.overlayTarget.style.top = '0px';
        this.overlayTarget.style.left = '0px';
        this.overlayTarget.style.width = '0px';
        this.overlayTarget.style.height = '0px';
    }

    /**
     * Returns the populated HTML template for the Popover content
     * @returns {string} Populated HTML template
     */
    get populatedTemplate() {
        return this.template
            .replace('{{currentStep}}', this.currentExplanation + 1)
            .replace('{{totalSteps}}', this.totalSteps)
            .replace('{{prevButton}}', this.prevButton)
            .replace('{{nextButton}}', this.nextButton)
            .replace('{{content}}', this.content);
    }

  /**
   * Returns the HTML style tag with default styles
   * @returns {string} HTML style tag
   */
    get styles() {
      return `
      <style>
        .onboardOverlay {
            box-shadow: rgb(233 77 77 / 80%) 0 0 1px 2px,
            rgb(84 84 84 / 50%) 0 0 0 5000px;
            box-sizing: content-box;
            position: absolute;
            border-radius: 4px;
            transition: all .3s ease-out;
            z-index: 9998;
            pointer-events: none;
            opacity: 0;
        }
  
        .onboardOverlay.active {
            opacity: 1;
        }
  
        .onboard-popover {
            z-index: 9999;
        }
      </style>
      `
    }

    /**
     * Returns the HTML template structure for the Popover content
     * @returns {string} HTML template
     */
    get template() {
        return `
      <div class="overlay-template">
        <div class="d-flex flex-row justify-content-between">
          <h1>Step {{currentStep}} of {{totalSteps}}</h1>
          <button type="button" class="btn-close onboard-close" aria-label="Close"></button>
        </div>
        <p>{{content}}</p>
        <div class="d-flex flex-row justify-content-between">
          {{prevButton}}
          {{nextButton}}
        </div>
      </div>
    `;
    }

    /**
     * Returns the HTML for the previous button, or an empty string if on the first step
     * @returns {string} Previous button HTML
     */
    get prevButton() {
        if (this.currentExplanation <= 0) return '';

        return `<button class="btn btn-secondary onboard-prev">Prev step</button>`;
    }

    /**
     * Returns the HTML for the next button, or a "Done" button if on the last step
     * @returns {string} Next or Done button HTML
     */
    get nextButton() {
        if (this.currentExplanation >= this.coordinates.length - 1) {
            return `<button class="btn btn-primary onboard-finish">Done!</button>`;
        } else {
            return `<button class="btn btn-primary onboard-next">Next step</button>`;
        }
    }

    /**
     * Binds click events to the Popover navigation buttons
     */
    bindPopoverEvents() {
        const popoverElement = document.querySelector('.onboard-popover');
        if (popoverElement) {
            popoverElement.addEventListener('click', (event) => {
                if (event.target.classList.contains('onboard-prev')) {
                    this.previousExplanation();
                } else if (event.target.classList.contains('onboard-next')) {
                    this.nextExplanation();
                } else if (event.target.classList.contains('onboard-finish')) {
                    this.hideOnboarding();
                } else if (event.target.classList.contains('onboard-close')) {
                    this.hideOnboarding();
                }
            });
        }
    }
}
