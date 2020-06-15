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
            'applicationId': 'my_application',
            'maxInactivitySeconds': 15,
            'inactivityDialogDuration': 10,
            'inactivityLogoutUrl': 'https://www.google.com/?automatic',
            'manualLogoutUrl': 'https://www.google.com/?manual',
            'heartRate': 5
        });
    });
</script>
```

## Default Settings
Idle Hands uses the following default settings:

```javascript
{
    activityEvents: 'click keypress scroll wheel mousewheel mousemove',
    applicationId: 'idle-hands',
    dialogMessage: 'Your session is about to expire due to inactivity.',
    dialogTimeRemainingLabel: 'Time remaining',
    dialogTitle: 'Session Expiration Warning',
    heartbeatUrl: window.location.href,
    heartRate: 300,
    inactivityLogoutUrl: 'https://www.google.com',
    inactivityDialogDuration: 45,
    localStoragePrefix: null,
    manualLogoutUrl: null,
    maxInactivitySeconds: 600
}
```

If `localStoragePrefix` is left `null`, then the `applicatioinId` is used.  Similarly, if `manualLogoutUrl` is left `null`, then `inactivityLogoutUrl` is used.