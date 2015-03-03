/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        var listeners = document.querySelectorAll('[data-role="pagelink"]'),
                           bar = document.querySelector('.swoosh'),
                           currentTab = document.querySelector('.activetab'),
                           currentTabId = currentTab.getAttribute('href').split('#'),
                            pages = document.querySelectorAll('[data-role="page"]'),
                           currentPage = document.querySelector('#home'),
                           hammertime = [],
                           hit = false,
                           newTab = null,
                           upperbound = listeners.length;

        // setup hammertime
        for (var i = 0; i < upperbound; i++) {
            hammertime[i] = new Hammer(listeners[i]);
            hammertime[i].on('tap', swoosh);
        }

        // initialize pages to default styles for transitions
        for (i = 0; i < upperbound; i++) {
            if (currentPage.id != pages[i].id) {
                pages[i].style.display = 'none';
            }
            else {
                pages[i].style.opacity = '1';
            }
        }

        // 
        function swoosh(ev) {
            var newTabId = ev.target.href.split('#');
            newTab = ev.target;
            currentTab.removeAttribute('class');
            newTab.setAttribute('class', 'activetab');
            newPage = document.querySelector('#' + newTabId[1]);

            // if new page is the current page do nothing.
            if (currentTab == newTab) { return; }

            //process clicks/taps etc
            switch (newTabId[1]) {
                case "home":
                    // animate bar
                    bar.style.left = '0%';
                    draw();
                    break;

                case "two":
                    // animate bar
                    bar.style.left = '33.33%';
                    draw();
                    getMap();
                    break;

                case "three":
                    // animate bar
                    bar.style.left = '66.66%'
                    getContact();
                    draw();
                    break;
            }
            currentTab = newTab;

            // animate pages... need to 
            function draw() {
                currentPage.setAttribute('class', 'hide');
                setTimeout(function () { newPage.style.display = 'block'; }, 260); //300
                setTimeout(function () { currentPage.setAttribute('style', 'display: none'); }, 380); //380
                setTimeout(function () { newPage.style.opacity = '1'; }, 270); //300
                setTimeout(function () { newPage.setAttribute('class', 'active'); }, 250); // 220 seems to eliminate flash
                setTimeout(function () { currentPage = newPage; }, 550); //550
            }

            function getMap() {
                var source = '';
                hasGeo();
                function hasGeo() {
                    if (navigator.geolocation) {
                        params = { enableHighAccuracy: true, timeout: 3600, maximumAge: 0 };
                        navigator.geolocation.getCurrentPosition(reportPosition, gpsError, params);
                    } else {
                        showError();
                    }
                }

                // show error if location service not supported
                function showError() {
                    alert('Location services not supported');
                }

                // location services gps issues
                function gpsError(error) {
                    var errors = {
                        1: 'Permission denied',
                        2: 'Position unavailable',
                        3: 'Request timeout'
                    };
                    alert("Error: " + errors[error.code]);
                }

                // provide location info and fetch img
                function reportPosition(position) {
                    var lat = position.coords.latitude,
                        long = position.coords.longitude;
                    source = "https://maps.googleapis.com/maps/api/staticmap?center=" + lat + ',' + long + '&zoom=14&size=720x720&markers=color:blue%7C' + lat + ',' + long;
                    mapImg = document.querySelector('.map');
                    mapImg.setAttribute('src', source);
                }
            }

            function getContact() {
                var contactPage = document.querySelector('#three');
                var options = new ContactFindOptions();
                options.filter = '';
                options.multiple = true;
                var filter = ['displayName'];
                
                // prevent contacts from aggregating on page after first visit
                if (hit) {
                    var delPerson = document.querySelector('.person');
                    contactPage.removeChild(delPerson);
                    hit = false;
                }

                navigator.contacts.find(filter, success, err, options);

                function success(matches) {
                    var newFrag = document.createDocumentFragment(),
                        min = 0,
                        max = matches.length - 1,
                        id = Math.round(Math.random() * (max - min) + min);
                 
                    var people = document.createElement('div');
                    people.setAttribute('class', 'person');

                    var name = document.createElement('p');
                    name.setAttribute('class', 'name');
                    name.textContent = "Name: " + matches[id].displayName;
                    people.appendChild(name);

                    var nick = document.createElement('p');
                    nick.setAttribute('class', 'nickname');
                    nick.textContent = "Nickname: " + matches[id].nickname;
                    people.appendChild(nick);

                   // if phone numbers are present
                        if (matches[id].phoneNumbers.length > 0) {
                            var phone = document.createElement('p');
                            phone.setAttribute('class', 'phone');

                            // loop through phone array
                            for (var i = 0; i < matches[id].phoneNumbers.length; i++) {
                                var phoneNum = document.createElement('p');
                                phoneNum.setAttribute('class', 'phoneNum');
                                phoneNum.textContent = matches[id].phoneNumbers[i].type + ": " + matches[id].phoneNumbers[i].value;
                                phone.appendChild(phoneNum);
                            }
                            people.appendChild(phone);
                        } 
                        newFrag.appendChild(people);
                        contactPage.appendChild(newFrag);
                    hit = true;
                }

                function err() {
                    var errMessage = document.createElement('p');
                    errMessage.textContent = "Something went wrong... Not sure what.. Im new here";
                    contactPage.appendChild(errMessage);
                }
            }
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
    }
};

app.initialize();