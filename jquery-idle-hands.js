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

        let heartbeat = function () {
            $.get(HEARTBEAT_URL);
        }

        let startHeartbeatTimer = function () {
            heartbeatTimer = setInterval(heartbeat, (HEART_RATE * 1000));
        }

        let stopHeartbeatTimer = function () {
            clearInterval(heartbeatTimer);
        }

        /* -------------------------------------------------- */
        // CHECK INACTIVITY
        /* -------------------------------------------------- */

        let checkInactivity = function () {
            elapsedSeconds = Math.floor(($.now() - getSessionStartTime()) / 1000);

            let remainingSeconds = (MAX_INACTIVITY_SECONDS - elapsedSeconds);
            let secondsLabel = (remainingSeconds == 1) ? 'second' : 'seconds';

            $('#' + APPLICATION_ID + '-time-remaining').text(remainingSeconds + ' ' + secondsLabel);

            if ((elapsedSeconds > MAX_INACTIVITY_SECONDS) || !Lockr.get('sessionStartTime')) {
                logout(INACTIVITY_LOGOUT_URL);
            } else if ((MAX_INACTIVITY_SECONDS - elapsedSeconds) <= INACTIVITY_DIALOG_DURATION) {
                $(document).off(ACTIVITY_EVENTS, activityHandler);

                showDialog();
            } else {
                hideDialog();
            }
        }

        let startInactivityTimer = function () {
            setSessionStartTime($.now());

            inactivityTimer = setInterval(checkInactivity, 1000);
        };

        let stopInactivityTimer = function () {
            clearInterval(inactivityTimer);
        }

        let restartInactivityTimer = function () {
            stopInactivityTimer();
            startInactivityTimer();
        }

        let activityHandler = function (event) {
            restartInactivityTimer();
        }

        /* -------------------------------------------------- */
        // STORAGE
        /* -------------------------------------------------- */

        let setSessionStartTime = function (time) {
            Lockr.set('sessionStartTime', time);
            sessionStartTime = time;
        }

        let getSessionStartTime = function () {
            return Lockr.get('sessionStartTime');
        }

        let deleteSessionStartTime = function () {
            return Lockr.rm('sessionStartTime');
        }

        /* -------------------------------------------------- */
        // DIALOG
        /* -------------------------------------------------- */

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

        let showDialog = function () {
            document.title = DIALOG_TITLE;

            $('#' + APPLICATION_ID).show(function () {
                $('#' + APPLICATION_ID + ' button').first().focus();
            });
        }

        let hideDialog = function () {
            document.title = originalPageTitle;
            $('#' + APPLICATION_ID ).hide();
        }

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

        let stayLoggedIn = function () {
            Lockr.flush();

            restartInactivityTimer();

            $(document).on(ACTIVITY_EVENTS, activityHandler);

            hideDialog();
        }

        /* -------------------------------------------------- */
        // START IDLE HANDS
        /* -------------------------------------------------- */

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