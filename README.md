# Stimulus Onboarding Controller

A Stimulus controller for creating guided onboarding tours in Rails applications.

## Installation

You can install the package from GitHub Packages:

```bash
# First, authenticate with GitHub Packages
npm login --registry=https://npm.pkg.github.com
# Then install the package
npm install @its-bede/stimulus-onboarding
# Or with yarn
yarn add @its-bede/stimulus-onboarding
```

## Usage

1. Register the controller in your Stimulus application:

```javascript
// app/javascript/controllers/index.js
import { Application } from "@hotwired/stimulus"
import { OnboardingController } from "@its-bede/stimulus-onboarding"

const application = Application.start()
application.register("onboarding", OnboardingController)
```

2. Add the controller to your HTML:

```html
<div data-controller="onboarding">
  <div data-onboarding-target="overlay" class="onboardOverlay"></div>
  
  <div data-onboarding-target="explanation" data-target-element="step1">
    Welcome to our app! This is the first step.
  </div>
  
  <div data-onboarding-target="explanation" data-target-element="step2">
    Here's where you can find your settings.
  </div>
</div>
```

3. Style the overlay (optional - default styles are included):

```css
/* You can override the default styles */
.onboardOverlay {
  /* your custom styles */
}
```

## Configuration

You can customize the timeout before the onboarding starts:

```html
<div data-controller="onboarding" data-onboarding-timeout-value="2000">
  <!-- Content -->
</div>
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the package: `npm run build`

## License

MIT