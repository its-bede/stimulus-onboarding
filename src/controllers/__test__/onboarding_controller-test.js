import { Application } from '@hotwired/stimulus';
import { OnboardingController } from '../onboarding_controller';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('OnboardingController', () => {
  let application;

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
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes with correct default values', () => {
    expect(document.querySelector('.onboardOverlay')).toBeInTheDocument();
  });

  it('shows first explanation after timeout', async () => {
    await waitFor(() => {
      expect(document.querySelector('.onboard-popover')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('advances to next step when clicking next', async () => {
    const user = userEvent.setup();

    await waitFor(() => {
      expect(document.querySelector('.onboard-popover')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Next step'));

    expect(document.querySelector('.onboard-popover')).toHaveTextContent('Step 2 of 2');
  });

  it('closes onboarding when clicking finish', async () => {
    const user = userEvent.setup();

    await waitFor(() => {
      expect(document.querySelector('.onboard-popover')).toBeInTheDocument();
    });

    // Advance to last step
    await user.click(screen.getByText('Next step'));
    await user.click(screen.getByText('Done!'));

    expect(document.querySelector('.onboard-popover')).not.toBeInTheDocument();
  });
});