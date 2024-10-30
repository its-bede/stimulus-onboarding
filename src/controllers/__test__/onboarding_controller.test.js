// src/controllers/__tests__/onboarding_controller.test.js
import { Application } from '@hotwired/stimulus';
import { OnboardingController } from '../onboarding_controller';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('OnboardingController', () => {
  let application;
  let controller;
  let element;

  beforeEach(() => {
    document.body.innerHTML = `
      <div data-controller="onboarding">
        <div data-onboarding-target="overlay" class="onboardOverlay"></div>
        <div id="step1">Target 1</div>
        <div data-onboarding-target="explanation" data-target-element="step1">
          First step explanation
        </div>
        <div id="step2">Target 2</div>
        <div data-onboarding-target="explanation" data-target-element="step2">
          Second step explanation
        </div>
      </div>
    `;

    application = Application.start();
    application.register('onboarding', OnboardingController);

    // Setup controller reference for all tests
    element = document.querySelector('[data-controller="onboarding"]');
    controller = application.getControllerForElementAndIdentifier(element, 'onboarding');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes with correct default values', () => {
    const overlay = document.querySelector('.onboardOverlay');
    expect(overlay).toBeInTheDocument();
    expect(controller.timeoutValue).toBe(1000);
  });

  it('updates coordinates when initialized', () => {
    controller.initializeCoordinates();

    expect(controller.coordinates).toHaveLength(2); // Should be 2 since we have 2 explanation targets
    expect(controller.coordinates[0]).toMatchObject({
      explanation: expect.any(Element),
      top: expect.any(Number),
      left: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number)
    });
  });

  it('shows first explanation after timeout', async () => {
    // Override timeout for faster testing
    controller.timeoutValue = 100;

    await waitFor(() => {
      expect(document.querySelector('.onboard-popover')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('advances to next step when clicking next', async () => {
    const user = userEvent.setup();

    // Show first step
    controller.timeoutValue = 100;
    await waitFor(() => {
      expect(document.querySelector('.onboard-popover')).toBeInTheDocument();
    });

    // Click next
    await user.click(screen.getByText('Next step'));
    expect(document.querySelector('.onboard-popover')).toHaveTextContent('Step 2 of 2');
  });

  it('closes onboarding when clicking finish', async () => {
    const user = userEvent.setup();

    // Show first step
    controller.timeoutValue = 100;
    await waitFor(() => {
      expect(document.querySelector('.onboard-popover')).toBeInTheDocument();
    });

    // Advance to last step and click done
    await user.click(screen.getByText('Next step'));
    await user.click(screen.getByText('Done!'));

    expect(document.querySelector('.onboard-popover')).not.toBeInTheDocument();
  });

  it('hides onboarding when calling hideOnboarding', () => {
    const overlay = controller.overlayTarget;

    controller.hideOnboarding();

    expect(overlay).not.toHaveClass('active');
    expect(overlay.style.width).toBe('0px');
    expect(overlay.style.height).toBe('0px');
  });

  it('generates correct template with navigation buttons', () => {
    controller.currentExplanation = 0;
    const template = controller.populatedTemplate;

    // Check first step template
    expect(template).toContain('Step 1 of 2');
    expect(template).toContain('Next step');
    expect(template).not.toContain('Prev step');

    // Check last step template
    controller.currentExplanation = 1;
    const lastTemplate = controller.populatedTemplate;
    expect(lastTemplate).toContain('Step 2 of 2');
    expect(lastTemplate).toContain('Done!');
    expect(lastTemplate).toContain('Prev step');
  });
});