# Idle Hands
A jQuery plugin for managing user inactivity timeoutes across browsers windows.

## Requirements
* [jQuery](https://jquery.com/) - Idle Hands uses the jQuery library to more easily interact with the DOM and make ajax calls.
* [Basil.js](https://wisembly.github.io/basil.js/) - Idle Hands uses Basil.js as a `localStorage` wrapper to more easily persist data across browser windows and tabs.

## Usage
```html
<script>
    $(function () {
        $.idleHands()
    });
</script>
```

### With Custom Settings
```html
<script>
    $(function () {
        $.idleHands({
            applicationId: 'my_application',
            heartRate: 5,
            inactivityDialogDuration: 10,
            inactivityLogoutUrl: 'https://www.google.com',
            maxInactivitySeconds: 15
        });
    });
</script>
```

## Settings
|Name|Default Value|Description|
|---|---|--|
|`activityEvents`|`'click keypress scroll wheel mousewheel mousemove'`|This is a string of DOM event types which count as user activity.|
|`applicationId`|`'idle-hands'`|This is a unique identifier used to namespace local storage and HTML classes/IDs. It should be changed to something unique to your application.|
|`dialogMessage`|`'Your session is about to expire due to inactivity.'`|This is the message that appears inside of the inactivity dialog above the timer.|
|`dialogTimeRemainingLabel`|`'Time remaining'`| This is the message that appears in the inactivity dialog before the number of seconds remaining.|
|`dialogTitle`|`'Session Expiration Warning'`|This is the message that appears at the very top of the inactivity dialog.|
|`heartbeatUrl`|`window.location.href`|This is the "keep-alive" URL. Idle Hands will make an AJAX request to this URL once every `heartRate` number of seconds. This can be used to prevent your application session from expiring before the inactivity timer finishes counting down.|
|`heartRate`|`300`|This is how often Idle Hands will make an AJAX request to `heartbeatUrl`.|
|`inactivityLogoutUrl`|`'https://www.google.com'`|This is the URL that users will be redirected to if the inactivity dialog timer reaches 0 seconds.|
|`inactivityDialogDuration`|`45`|This is how before a user is logged out that the inactivity dialog will display for.|
|`localStoragePrefix`|`null`|Keys in key/value pairs saved in the browser are prefixed with this value to help prevent conflicts with other applications storing data in the browser. When left `null`, this defaults to `applicationId`.|
|`logoutNowButtonText`|`'Logout Now'`|This is the text that will display on the logout button in the inactivity dialog.|
|`manualLogoutUrl`|`null`|This is the URL that users will be redirected to if they click the logout button on the inactivity dialog. When left `null`, this will default to `inactivityLogoutUrl`.|
|`maxInactivitySeconds`|`60`|This is the number of seconds a user can remain inactive before they are automatically redirected to `inactivityLogoutUrl`.|
|`stayLoggedInButtonText`|`'Stay Logged In'`|This is the text that will display on the reset button in the inactivity dialog.|
