/**
 * Analytics POC for GRV Login and Register.
 */

// We need to store some state so we know where we are in the flows.
// Needs to be es5 for IE support.
var analyticsType = '';
var analyticsStep = '';
var analyticsValidation = '';

var analytictsTypeRegistration = 'registration';
var analytictsTypeLogin = 'login';

var analytictsValidationNonValidated = 'nonvalidated';
var analytictsValidationValidated = 'validated';

var analyticsRegistrationLicenseType = '';
var analyticsRegistrationLastFocus = '';

// Const for the GRV Registration Name passed into Omniture.
var grvRegistrationName = 'GRV 3.0';

function analyticsGetStepIndex(analyticsStep) {
  switch (analyticsStep) {
    case 'personal':
      return '1';

    case 'secondStep':
      return '2';

    case 'noLicenseStep':
    case 'noLicenseStepFailure':
      return '2B';

    case 'fourthStep':
      return '3';

    case 'submit':
    case 'success':
    case 'success2':
      return '4';

    default:
      return '0';
  }
}

function analyticsHandleHelixEvent(event) {
  switch (event.name) {
    // Check for and handle A clicks.
    // NP-1994.
    case 'GrvStepAnchorClick':
      var element = undefined;

      if (event.meta[0].path) {
        // Modern browser:
        element = event.meta[0].path[0];
      }
      else {
        if (event.meta[0].srcElement) {
          // IE.
          element = event.meta[0].srcElement;
        }
      }

      if (element) {
        if (analyticsType === analytictsTypeRegistration) {
          // NP-2443 - Registration has its own link click handler requrirements.
          var linkLabel = element.innerText;

          // Step 1 - Privacy click handler.
          if (event.path[0] === 'personal' && linkLabel === "here") {
            analyticsLogThreeBarRegisterEvent('Privacy Policy');
          }

          // Step 3. NP-2447 Handle Step 3 a tag clicks.
          if (event.path[0] === 'fourthStep') {
            switch (linkLabel) {
              case 'Privacy Policy':
                analyticsLogThreeBarRegisterEvent('Privacy Policy');
                break;
              case 'Terms of Use':
                analyticsLogThreeBarRegisterEvent('Terms of Use');
                break;
            }
          }
        }
        else {
          var linkLabel = element.innerText;
          var linkExternal = (element.host.toLowerCase() != window.location.host.toLowerCase() && element.host != '');

          var linkTitle = 'GRV 3.0 link | ' + analyticsType + ' | ' + linkLabel + ' | ' + element.href;

          if (typeof (s) !== 'undefined') {
            s.pfLinkName(linkTitle, linkExternal ? 'external' : 'internal');
          }
        }
      }

      break;

    // Check for and handle clicks on buttons.
    case 'HelixButtonClick':
      // NP-2442 - Change the analytics script to detect button clicks rather than step transitions.
      // Only check id the button is enabled, and we are in a registration flow.
      if (analyticsType === analytictsTypeRegistration && event.meta[0].disabled === false) {

        // Step 1 to Step 2:
        if (event.path[1] === 'personal' && event.meta[0].value === 'secondStep') {
          analyticsLogThreeBarRegisterEvent('Continue');
        }

        // Step 2 to Step 2B:
        if (event.path[1] === 'secondStep' && event.meta[0].value === 'noLicenseStep') {
          analyticsLogThreeBarRegisterEvent("I don't have a license number");
        }

        // Step 2 to Step 3:
        if (event.path[1] === 'secondStep' && event.meta[0].value === 'fourthStep') {
          analyticsLogThreeBarRegisterEvent('Continue with ' + analyticsRegistrationLicenseType);
        }

        // Step 2B to Step 3:
        if (event.path[1] === 'noLicenseStep' && event.meta[0].value === 'fourthStep') {
          analyticsLogThreeBarRegisterEvent('Continue');
        }
        if (event.path[1] === 'noLicenseStepFailure' && event.meta[0].value === 'fourthStep') {
          analyticsLogThreeBarRegisterEvent('Continue');
        }

        // Step 3 to Complete:
        if (event.path[1] === 'fourthStep' && event.meta[0].value === 'submit') {
          analyticsLogThreeBarRegisterEvent('Registration Completed');
        }
      }
      break;

    // Check for and handle textboxes and selects obtaining focus.
    case 'HelixInputFocus':
    case 'grvSelectFocus':
      // NP-2444 - Detect focus events
      if (analyticsType === analytictsTypeRegistration) {
        // Occasionally Helix if firing multiple events focus events, only handle changes.
        if (analyticsRegistrationLastFocus !== event.meta[0].analyticsName) {

          analyticsRegistrationLastFocus = event.meta[0].analyticsName;

          analyticsLogThreeBarRegisterEvent(analyticsRegistrationLastFocus);

          // Track the user's selection of DEA or SLN:
          switch (analyticsRegistrationLastFocus) {
            case 'DEA Number':
              analyticsRegistrationLicenseType = 'DEA';
              break;

            case 'State License Number':
            case 'State':
              analyticsRegistrationLicenseType = 'SLN';
              break;
          }
        }
      }
      break;

    // Check for and the Login Initiated event.
    case 'GrvLoginInitiated':
      analyticsLogLoginEvent('initiated', event);
      analyticsType = analytictsTypeLogin;
      analyticsStep = '';
      analyticsValidation = '';
      break;

    // Check for and the Login Completed event.
    case 'GrvLoginCompleted':
      analyticsLogLoginEvent('completed', event);
      analyticsType = '';
      analyticsStep = '';
      analyticsValidation = '';
      break;

    // Check for and the Registration Initiated event.
    case 'GrvRegistrationInitiated':
      analyticsType = analytictsTypeRegistration;
      analyticsStep = 'personal';
      analyticsValidation = analytictsValidationNonValidated;
      analyticsLogRegisterEvent('initiated', '');
      break;

    // Check for and the Registration Completed event.
    case 'GrvRegistrationCompleted':
      var janrainID = event.meta[0].janrainId;
      analyticsLogRegisterEvent('completed', janrainID);
      analyticsType = '';
      analyticsStep = '';
      analyticsValidation = '';
      break;

    // Check for and handle generic registration flow errors.
    case 'GRVRegistrationFlowError':
      s.pfPage('GRVRegistrationFlowError', '', 'Portal - Error', '', '', '', 'Website Utility', 'Pfizer', 'Original', 'PFIZERPRO', 'PP-MCL-USA-0228', '', '', '', '');
      break;

    // Check for and the Forgotten Password Flow Complete event.
    case 'GrvForgottenPasswordCompleted':
      // Call the Forgotton password function.
      if (typeof (s) !== 'undefined') {
        s.pfForgottenPassword(grvRegistrationName);
      }
      break;

    // Check for and the Change Password Flow Complete event.
    case 'GrvChangePasswordCompleted':
      // Call the Forgotton password function.
      if (typeof (s) !== 'undefined') {
        s.pfResetPassword(grvRegistrationName);
      }
      break;

    // Check for and handle Reset Password flow errors.
    case 'GRVResetPasswordError':
      s.pfPage('GRVResetPasswordError', '', 'Portal - Error', '', '', '', 'Website Utility', 'Pfizer', 'Original', 'PFIZERPRO', 'PP-MCL-USA-0228', '', '', '', '');
      break;

    // Handle GRV Step Pre Navigate events; this is now used to track the current step.
    // and check for auto navigations.
    case 'GrvStepPreNavigate':
      if (analyticsType === analytictsTypeRegistration) {

        // NP-2407 - Navigation is now tracked on button click, not navigate event.
        var analyticsStepFrom = event.meta[0].currentStep;
        var analyticsStepTo = event.meta[0].newStep;
        var analyticsStepError = event.meta[0].error;

        if (analyticsStepError) {
          var newDestinationName = analyticsGetStepIndex(analyticsStepTo);
          analyticsLogThreeBarRegisterEvent('Auto-Navigate to Step ' + newDestinationName);
        }

        // Check if we just navigated directly from step 2 to step 3, if so the user is validated.
        if (analyticsStepFrom === 'secondStep' && analyticsStepTo === 'fourthStep') {
          analyticsValidation = analytictsValidationValidated;
        }

        // NP-1761.
        // After sending the step navigation, set the to link to be the current
        // step.
        analyticsStep = analyticsStepTo;
      }
      break;

    // Check for and handle the user closing a registration flow.
    case 'GrvHeaderCloseClick':
      if (analyticsType === analytictsTypeRegistration) {
        analyticsLogThreeBarRegisterEvent('Close');
      }
      analyticsType = '';
      analyticsStep = '';
      break;

    // Check for and handle the user clicking back in a registration flow.
    case 'GrvHeaderBackClick':
      // NP-2442 - Detect back button clicks.
      if (analyticsType === analytictsTypeRegistration) {
        analyticsLogThreeBarRegisterEvent('Back');
      }
      break;

    // Check for and handle the user clicking the 'help' tool tip while registering.
    case 'GrvTooltip-Show':
      // NP-2446 - Detect help clicks.
      if (analyticsType === analytictsTypeRegistration) {
        analyticsLogThreeBarRegisterEvent('Need help');
      }
      break;

    // Check for and handle the user checking the US checkbox while registering.
    case 'HelixCheckboxSelect':
      // NP-2450 - Detect checkbox clicks.
      if (analyticsType === analytictsTypeRegistration) {
        analyticsLogThreeBarRegisterEvent(event.meta[0].analyticsName);
      }
      break;

    // Check for and handle errors that come from the licence validation service.
    case 'GrvUSLicenseValidationError':
      // NP-2449 - Detect license validation fails.
      if (analyticsType === analytictsTypeRegistration) {
        switch (event.meta[0].licenseType) {
          case "DEA":
            analyticsLogErrorRegisterEvent("dea-we've been unable to validate your entry, please try again");
            break;
          case "SLN":
            analyticsLogErrorRegisterEvent("sln-we've been unable to validate your entry, please try again");
            break;
        }

      }
      break;

    // Check for and handle errors that come from the registration service.
    case 'GrvSubmitFailed':
      // NP-2449 - Detect registration fails.
      if (analyticsType === analytictsTypeRegistration) {
        // Sometimes the message is returned as an array, sometimes a string.
        var message = Array.isArray(event.meta[0].message) ? event.meta[0].message[0] : event.meta[0].message;
        analyticsLogErrorRegisterEvent(message);
      }
      break;

    // Check for and handle the user entering an invalid license twice.
    case 'GrvStepContinueFail':
        // NP-2448 - Detect step fail navigation
        if (analyticsType === analytictsTypeRegistration) {
          if (event.meta[0].value === 'noLicenseStep') {
            analyticsLogThreeBarRegisterEvent('Auto-Navigate to Step 2B');
          }
        }
        break;
  }
};

/**
 * Log a login event.
 *
 * @param {string} action the action to log.
 */
function analyticsLogLoginEvent(action, event) {
  if (typeof (s) !== 'undefined') {
    // Login Type can be only Traditional or SSO.
    var loginType = 'traditional';

    // Pfizer Customer ID, User ID or NTID, GRV ID, whatever applicable. This
    // is mandatory for completion event only.
    var userId = event.meta[1] && event.meta[1].name === 'janrainId' ? event.meta[1].value : '';

    // Boolean variable, set to true if action takes place during page load.
    // Login events always happen as a result of user interaction
    var isPv = 'false';

    s.pfLogin(grvRegistrationName, action, loginType, userId, isPv);
  }
}

/**
 * Log a three bar register event.
 *
 * @param {string} bar3 the action to log.
 */
function analyticsLogThreeBarRegisterEvent(bar3) {
  if (typeof (s) !== 'undefined') {
    var stepName = analyticsGetStepIndex(analyticsStep);
    s.pfRegistrationInputWorkflow(grvRegistrationName, stepName, bar3);
  }
}

/**
 * Log an error register event
 *
 * @param {string} errorMessage the error to log.
 */
function analyticsLogErrorRegisterEvent(errorMessage) {
  if (typeof (s) !== 'undefined') {
    var stepName = analyticsGetStepIndex(analyticsStep);
    s.pfRegistrationWorkflow(grvRegistrationName, 'error', stepName, analyticsValidation, 'false', 'NA', errorMessage);
  }
}

/**
 * Log a register event (initiated/compleated).
 *
 * @param {string} action the action to log.
 */
function analyticsLogRegisterEvent(action, userId) {
  if (typeof (s) !== 'undefined') {
    var stepName = analyticsGetStepIndex(analyticsStep);
    s.pfRegistrationWorkflow(grvRegistrationName, action, stepName, analyticsValidation, 'false', '', '', userId);
  }
}

// Log HelixEvents.
window.addEventListener('helixEvent', function (event) {
  // Log the event name:
  analyticsHandleHelixEvent(event.detail);
}, false);
