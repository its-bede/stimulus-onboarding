# Installation Guide

## NPM Package

1. Add the package to your Rails application:
   ```bash
   npm install @its-bede/stimulus-onboarding
   # or
   yarn add @its-bede/stimulus-onboarding
   ```

2. Register the controller:
   ```javascript
   // app/javascript/controllers/index.js
   import { Application } from "@hotwired/stimulus"
   import { OnboardingController } from "@its-bede/stimulus-onboarding"

   const application = Application.start()
   application.register("onboarding", OnboardingController)
   ```

[See Usage Guide](./usage.md)