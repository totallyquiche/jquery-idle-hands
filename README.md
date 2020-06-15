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