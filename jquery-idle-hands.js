(function ($) {
    $.idleHands = function (userSettings) {
        /* -------------------------------------------------- */
        // GLOBAL VARIABLES
        /* -------------------------------------------------- */

        let defaultSettings = {
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
            logoutNowButtonText: 'Logout Now',
            manualLogoutUrl: null,
            maxInactivitySeconds: 600,
            stayLoggedInButtonText: 'Stay Logged In'
        };

        let settings = $.extend({}, defaultSettings, userSettings);

        // Set some fallback settings

        settings.localStoragePrefix = settings.localStoragePrefix || settings.applicationId;
        settings.manualLogoutUrl = settings.manualLogoutUrl || settings.inactivityLogoutUrl;

        let sessionStartTime;
        let heartbeatTimer;
        let inactivityTimer;
        let originalPageTitle = document.title;
        let localStorage = {};

        /* -------------------------------------------------- */
        // HEARTBEAT
        /* -------------------------------------------------- */

        /**
         * Makes an HTTP GET request to the provided URL.
         *
         * This is intended to be used as a "keep-alive" method to prevent users
         * sessions from expiring before the Idle Hands dialog appears.
         *
         * @param string heartbeat_url
         */
        let heartbeat = function (heartbeat_url) {
            $.get(heartbeat_url);
        }

        /**
         * Starts the heartbeat at a rate of once every HEART_RATE number of
         * seconds.
         */
        let startHeartbeatTimer = function () {
            heartbeatTimer = setInterval(
                function () {
                    heartbeat(settings.heartbeatUrl);
                },
                (settings.heartRate * 1000)
            );
        }

        /**
         * Stops the heartbeat. x_x
         */
        let stopHeartbeatTimer = function () {
            clearInterval(heartbeatTimer);
        }

        /* -------------------------------------------------- */
        // CHECK INACTIVITY
        /* -------------------------------------------------- */

        /**
         * Checks how long the user has been inactive for and either logs the user
         * out, displays the inactivity dialog, or hides the inactivity dialog.
         */
        let checkInactivity = function () {
            let sessionStartTime = getSessionStartTime();
            let elapsedSeconds = Math.floor(((new Date()).getTime() - sessionStartTime) / 1000);
            let remainingSeconds = (settings.maxInactivitySeconds - elapsedSeconds);
            let secondsLabel = (remainingSeconds == 1) ? 'second' : 'seconds';

            $('#jquery-idle-hands-time-remaining').text(
                remainingSeconds + ' ' + secondsLabel
            );

            // If we are over our inactivity limit or the session has been cleared,
            // log the user out; otherwise, if we are within the inactivity dialog
            // duration, stop tracking activity and show the dialog; otherwise,
            // hide the dialog.

            if ((elapsedSeconds > settings.maxInactivitySeconds) || !sessionStartTime) {
                logout(settings.inactivityLogoutUrl);
            } else if (remainingSeconds <= settings.inactivityDialogDuration) {
                $(document).off(settings.activityEvents, activityHandler);

                showDialog();
            } else {
                hideDialog();
            }
        }

        /**
         * Starts checking for inactivity every second.
         */
        let startInactivityTimer = function () {
            setSessionStartTime((new Date()).getTime());

            inactivityTimer = setInterval(checkInactivity, 1000);
        };

        /**
         * Stops checking for inactivity.
         */
        let stopInactivityTimer = function () {
            clearInterval(inactivityTimer);
        }

        /**
         * Stops checking inactivity and starts again with a new session start
         * time.
         */
        let restartInactivityTimer = function () {
            stopInactivityTimer();
            startInactivityTimer();
        }

        /**
         * An event handler intended to fire off when user activity is detected.
         *
         * @param Event event
         */
        let activityHandler = function (event) {
            restartInactivityTimer();
        }

        /* -------------------------------------------------- */
        // LOCAL STORAGE
        /* -------------------------------------------------- */

        /**
         * Set the wrapper used to manage local storage.
         */
         let initializeLocalStorage = function () {
            let config = {
              namespace: settings.localStoragePrefix,
              keyDelimiter: '.'
            };

            localStorage.basil = new window.Basil(config);
         }

         /**
          * Set a value in local storage.
          *
          * @param String key
          * @param mixed  value
          */
         localStorage.set = function (key, value) {
            localStorage.basil.set(key, value);
         }

         /**
          * Retrieve a value from local storage.
          *
          * @param String key
          *
          * @return mixed
          */
         localStorage.get = function (key) {
            return localStorage.basil.get(key);
         }

         /**
          * Removes a value from local storage by key.
          *
          * @param String key
          */
         localStorage.remove = function (key) {
            localStorage.basil.remove(key);
         }

         /**
          * Clear all values from local storage.
          */
         localStorage.flush = function () {
            localStorage.basil.reset();
          }

        /**
         * Sets the session start time in local storage.
         *
         * @param Number time
         */
        let setSessionStartTime = function (time) {
            localStorage.set('sessionStartTime', time);

            sessionStartTime = time;
        }

        /**
         * Retrieves the session start time from local storage.
         *
         * @return Number
         */
        let getSessionStartTime = function () {
            return localStorage.get('sessionStartTime');
        }

        /**
         * Deletes the session start time from local storage.
         */
        let deleteSessionStartTime = function () {
            localStorage.remove('sessionStartTime');
        }

        /**
         * Sets the logout URL in local storage.
         *
         * @return String
         */
         let setLogoutUrl = function (logoutUrl) {
            localStorage.set('logoutUrl', logoutUrl);
         }

        /**
         * Retrieves the logout URL from local storage.
         *
         * @return String
         */
         let getLogoutUrl = function () {
            return localStorage.get('logoutUrl');
         }

         /**
          * Clears values saved in local storage.
          */
          let flushLocalStorage = function () {
            localStorage.flush();
          }

        /* -------------------------------------------------- */
        // DIALOG
        /* -------------------------------------------------- */

        /**
         * Creates the dialog window and attaches it to the body element.
         *
         * Uses inline styles and IDs whenever possible to prevent conflicts with
         * external libraries and/or style sheets.
         */
        let createDialog = function () {
            let dialogContainer = '<div id="jquery-idle-hands">' +
                                  '<div id="jquery-idle-hands-overlay"></div>' +
                                  '<div id="jquery-idle-hands-dialog">' +
                                  '<div id="jquery-idle-hands-dialog-title">' + settings.dialogTitle + '</div>' +
                                  '<div id="jquery-idle-hands-message-container">' +
                                  '<p id="jquery-idle-hands-message">' + settings.dialogMessage + '</p>' +
                                  '<p id="jquery-idle-hands-time-remaining-label">' + (settings.dialogTimeRemainingLabel + ': ') +
                                  '<span id="jquery-idle-hands-time-remaining"></span>' +
                                  '</p>' +
                                  '</div>' +
                                  '<hr/>' +
                                  '<div id="jquery-idle-hands-button-container">' +
                                  '<button id="jquery-idle-hands-stay-logged-in-button">' + settings.stayLoggedInButtonText + '</button>' +
                                  '<button id="jquery-idle-hands-logout-button">' + settings.logoutNowButtonText + '</button>' +
                                  '</div>' +
                                  '</div>' +
                                  '</div>';

            $('body').append(dialogContainer);

            // Stay Logged In button

            $('#jquery-idle-hands-stay-logged-in-button').on('click', function (event) {
                event.stopPropagation();

                stayLoggedIn();
            });

            // Logout button

            $('#jquery-idle-hands-logout-button').on('click', function (event) {
                event.stopPropagation();

                logout(settings.manualLogoutUrl);
            });
        }

        /**
         * Shows the dialog window.
         */
        let showDialog = function () {
            document.title = settings.dialogTitle;

            $('#jquery-idle-hands').show(function () {
                $('#jquery-idle-hands button').first().focus();
            });
        }

        /**
         * Hides the dialog window.
         */
        let hideDialog = function () {
            document.title = originalPageTitle;

            $('#jquery-idle-hands').hide();
        }

        /**
         * Logs the user out and redirects them to the logout URL.
         *
         * This checks local storage for a logout URL and redirects there; if
         * one was not previously set, this function sets it using the logoutURL
         * parameter before redirecting.
         *
         * @param String logoutUrl
         */
        let logout = function (logoutUrl) {
            if (!getLogoutUrl()) {
                setLogoutUrl(logoutUrl);
            }

            stopHeartbeatTimer();
            stopInactivityTimer();
            deleteSessionStartTime();

            $('#jquery-idle-hands-dialog').hide();

            window.location.href = getLogoutUrl();
        }

        /**
         * Clears local storage and resets the inactivity timer to keep the user
         * logged in as if they just loaded the page.
         */
        let stayLoggedIn = function () {
            flushLocalStorage();

            restartInactivityTimer();

            $(document).on(settings.activityEvents, activityHandler);

            hideDialog();
        }

        /* -------------------------------------------------- */
        // START IDLE HANDS
        /* -------------------------------------------------- */

        /**
         * Initializes Idle Hands.
         */
        let initialize = function () {
            initializeLocalStorage();

            flushLocalStorage();

            $(document).on(settings.activityEvents, activityHandler);

            createDialog();
            startHeartbeatTimer();
            startInactivityTimer();
        }

        initialize();
    };
}(jQuery));