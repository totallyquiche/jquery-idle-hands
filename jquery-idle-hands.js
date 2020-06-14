(function ($) {
    $.fn.idleHands = function (config) {
        /* -------------------------------------------------- */
        // CONFIG CONSTANTS
        /* -------------------------------------------------- */

        const ACTIVITY_EVENTS = config.activityEvents || 'click keypress scroll wheel mousewheel mousemove';
        const APPLICATION_ID = config.applicationId || 'idle-hands';
        const DIALOG_MESSAGE = config.dialogMessage || 'Your session is about to expire due to inactivity.';
        const DIALOG_TIME_REMAINING_LABEL = config.dialogTimeRemainingLabel || 'Time remaining';
        const DIALOG_TITLE = config.dialogTitle || 'Session Expiration Warning';
        const HEARTBEAT_URL = config.heartbeatUrl || window.location.href;
        const HEART_RATE = config.heartRate || 300;
        const INACTIVITY_LOGOUT_URL = config.inactivityLogoutUrl || 'https://www.google.com';
        const INACTIVITY_DIALOG_DURATION = config.inactivityDialogDuration || 45;
        const LOCKR_PREFIX = config.lockrPrefix || (APPLICATION_ID + '_');
        const MANUAL_LOGOUT_URL = config.manualLogoutUrl || INACTIVITY_LOGOUT_URL;
        const MAX_INACTIVITY_SECONDS = config.maxInactivitySeconds || 600;

        /* -------------------------------------------------- */
        // GLOBAL VARIABLES
        /* -------------------------------------------------- */

        let sessionStartTime;
        let heartbeatTimer;
        let inactivityTimer;
        let elapsedSeconds;
        let originalPageTitle = document.title;

        /* -------------------------------------------------- */
        // HEARTBEAT
        /* -------------------------------------------------- */

        /**
         * Makes an AJAX request to the provided URL.
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
                heartbeat(HEARTBEAT_URL),
                (HEART_RATE * 1000)
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
            elapsedSeconds = Math.floor(
                ($.now() - getSessionStartTime()) / 1000
            );

            let remainingSeconds = (MAX_INACTIVITY_SECONDS - elapsedSeconds);
            let secondsLabel = (remainingSeconds == 1) ? 'second' : 'seconds';

            $('#' + APPLICATION_ID + '-time-remaining').text(
                remainingSeconds + ' ' + secondsLabel
            );

            if ((elapsedSeconds > MAX_INACTIVITY_SECONDS) || !Lockr.get('sessionStartTime')) {
                logout(INACTIVITY_LOGOUT_URL);
            } else if (remainingSeconds <= INACTIVITY_DIALOG_DURATION) {
                $(document).off(ACTIVITY_EVENTS, activityHandler);

                showDialog();
            } else {
                hideDialog();
            }
        }

        /**
         * Starts checking for inactivity every second.
         */
        let startInactivityTimer = function () {
            setSessionStartTime($.now());

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
        // STORAGE
        /* -------------------------------------------------- */

        /**
         * Sets the session start time in local storage.
         *
         * @param Number time
         */
        let setSessionStartTime = function (time) {
            Lockr.set('sessionStartTime', time);

            sessionStartTime = time;
        }

        /**
         * Retrieves the session start time from local storage.
         *
         * @return Number
         */
        let getSessionStartTime = function () {
            return Lockr.get('sessionStartTime');
        }

        /**
         * Deletes the session start time from local storage.
         */
        let deleteSessionStartTime = function () {
            Lockr.rm('sessionStartTime');
        }

        /* -------------------------------------------------- */
        // DIALOG
        /* -------------------------------------------------- */

        /**
         * Creates the dialog window and attaches it to the body element.
         */
        let createDialog = function () {
            let dialogContainerStyle = 'display: none;' +
                                       'z-index: 1000;';

            let overlayStyle = 'position:fixed;' +
                               'width: 100%;' +
                               'height: 100%;' +
                               'top: 0;' +
                               'left: 0;' +
                               'right: 0;' +
                               'bottom: 0;' +
                               'background-color: rgba(0, 0, 0, 0.25);' +
                               'z-index: 1;';

            let dialogStyle = 'position: absolute;' +
                              'top: 50%;' +
                              'left: 50%;' +
                              'transform: translate(-50%, -50%);' +
                              'z-index: 2;' +
                              'background-color: #ffffff;' +
                              'border-radius: 4px;' +
                              'padding: 4px;' +
                              'min-width: 300px;' +
                              "font-family: 'Verdana', sans-serif;" +
                              'font-weight: 400;' +
                              'box-shadow: 0px 0px 3px black;';

            let dialogTitleStyle = 'text-align: center;' +
                                   'background-color: #1484c8;' +
                                   'padding: 5px;' +
                                   'border-radius: 4px;' +
                                   'font-size: 1.2rem;' +
                                   'font-weight: 700;' +
                                   'color: #ffffff;';

            let dialogMessageContainerStyle = 'padding: 10px;';

            let dialogHrStyle = 'margin: 0 0 4px 0;' +
                                'border: 1px solid silver;' +
                                'border-top: none;';

            let dialogButtonStyle = 'width: 40%;' +
                                    'padding: 5px 0;' +
                                    'margin: 1% 5%;';

            let overlay = '<div style="' + overlayStyle + '" id="' +  APPLICATION_ID + '-overlay"></div>';

            let dialogTitle = '<div style="' + dialogTitleStyle + '" id="' + APPLICATION_ID + '-dialog-title">' +
                              DIALOG_TITLE +
                              '</div>';

            let dialogMessage = '<div style="' + dialogMessageContainerStyle + '" id="' + APPLICATION_ID + '-message-container">' +
                                '<p id="' + APPLICATION_ID + '-message">' + DIALOG_MESSAGE + '</p>' +
                                '<p>' + DIALOG_TIME_REMAINING_LABEL + ': <span id="' + APPLICATION_ID + '-time-remaining"></span></p>' +
                                '</div>';

            let dialog = '<div style="' + dialogStyle + '" id="' + APPLICATION_ID + '-dialog">' +
                         dialogTitle +
                         dialogMessage +
                         '<hr style="' + dialogHrStyle + '" />' +
                         '<button style="' + dialogButtonStyle + '" id="' + APPLICATION_ID + '-stay-logged-in-button">Stay Logged In</button>' +
                         '<button style="' + dialogButtonStyle + '" id="' + APPLICATION_ID + '-logout-button">Logout Now</button>' +
                         '</div>';

            let dialogContainer = '<div style="' + dialogContainerStyle  + '" id="' + APPLICATION_ID + '">' +
                                   overlay +
                                   dialog +
                                   '</div>';

            $('body').append(dialogContainer);

            $('#' + APPLICATION_ID + '-stay-logged-in-button').on('click', function (event) {
                event.stopPropagation();

                stayLoggedIn();
            });

            $('#' + APPLICATION_ID + '-logout-button').on('click', function (event) {
                event.stopPropagation();

                logout(MANUAL_LOGOUT_URL);
            });
        }

        /**
         * Shows the dialog window.
         */
        let showDialog = function () {
            document.title = DIALOG_TITLE;

            $('#' + APPLICATION_ID).show(function () {
                $('#' + APPLICATION_ID + ' button').first().focus();
            });
        }

        /**
         * Hides the dialog window.
         */
        let hideDialog = function () {
            document.title = originalPageTitle;
            $('#' + APPLICATION_ID ).hide();
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
            if (!Lockr.get('logoutUrl')) {
                Lockr.set('logoutUrl', logoutUrl);
            }

            stopHeartbeatTimer();
            stopInactivityTimer();
            deleteSessionStartTime();

            $('#' + APPLICATION_ID + '-dialog').hide();

            window.location.href = Lockr.get('logoutUrl');
        }

        /**
         * Clears local storage and resets the inactivity timer to keep the user
         * logged in as if they just loaded the page.
         */
        let stayLoggedIn = function () {
            Lockr.flush();

            restartInactivityTimer();

            $(document).on(ACTIVITY_EVENTS, activityHandler);

            hideDialog();
        }

        /* -------------------------------------------------- */
        // START IDLE HANDS
        /* -------------------------------------------------- */

        /**
         * Initializes Idle Hands.
         */
        let initialize = function () {
            Lockr.prefix = LOCKR_PREFIX;

            Lockr.flush();

            $(document).on(ACTIVITY_EVENTS, activityHandler);

            createDialog();
            startHeartbeatTimer();
            startInactivityTimer();
        }

        initialize();
    };
}(jQuery));