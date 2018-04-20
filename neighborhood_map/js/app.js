// global var
var map;
var marker;


// load map
function initMap() {

    // map presets
    var mapOptions = {
        zoom: 11,
        // make center of map San Antonio
        center: {
            lat: 29.4241226,
            lng: -98.493629
        }
    }
    // create new map using map options
    map = new
    google.maps.Map(document.getElementById("map"), mapOptions);

    // handle map error
    function googleError() {
        alert("Google doesn't want to play!");
    }


    // loop through data to assign values for markers
    for (i = 0; i < data.length; i++) {
        var position = data[i].latlong;
        var icon = data[i].iconImg;
        var title = data[i].locTitle;

        // create markers
        marker = new google.maps.Marker({
            map: map,
            position: position,
            icon: icon,
            title: title,
            animation: google.maps.Animation.DROP
        });

        // link marker data to setVisible
        vm.dataList()[i].marker = marker;

        // set width of pop up window
        var infoWindow = new google.maps.InfoWindow({
            maxWidth: 125
        });

        // add click event to bounce and pop up info window
        marker.addListener('click', function() {
            selected(this);
            loadInfo(this, infoWindow);
        });

        // set maker to bounce once on click
        function selected(marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null)
            }, 750);
        }


        // takes marker object and uses data to create markers on map
        function loadInfo(marker, infoWindow) {
            var self = this

            this.title = marker.title;
            this.pos = String(marker.position);
            this.index = this.pos.indexOf(",");
            this.lat = this.pos.slice(1, (this.index - 1));
            this.lng = this.pos.slice((this.index + 2), -1);
            this.id = "";
            this.address = "";
            this.photo = "";

            // foursquare auth info
            var id = "GW3JTNSLU2DU0RLSBMVCHMJ3251CJHYWVFUTXKBWURDCDY3I";
            var secret = "0VCSTSOSU4TQTUEMLHWACVCYBELTAJIO4RPP0DWMORQ52OKZ";

            // first query to get location id
            var firstURL = "https://api.foursquare.com/v2/venues/search?ll=" + this.lat + "," + this.lng + "&client_id=" + id + "&client_secret=" + secret + "&v=20180419";

            $.getJSON(firstURL).done(function(query) {
                var info = query.response.venues[0];
                self.id = info.id;

                // second query to use location id and pull photo data
                var finalURL = "https://api.foursquare.com/v2/venues/" + self.id + "?&client_id=" + id + "&client_secret=" + secret + "&v=20180419";

                $.getJSON(finalURL).done(function(query) {
                    var info = query.response.venue;
                    self.address = info.location.address;
                    self.photo = "https://igx.4sqi.net/img/general/100x100" + info.bestPhoto.suffix;

                    // style info window
                    infoWindow.setContent('<div class="flex"><div class="text"><h3>' + self.title + '</h3>' + self.address + '<img src="' + self.photo + '">');
                    infoWindow.open(map, marker);
                });
                // error pop up if this breaks
            }).fail(function() {
                alert("Unable to find Foursquare location data!");
            });
        }


    };
    // enable use of variables from the viewModel
    ko.applyBindings(vm);
}


var ViewModel = function() {
    var self = this;

    // build locations from data.js
    var Location = function(data) {
        this.position = data.latlong;
        this.icon = data.iconImg;
        this.title = data.locTitle;
        this.type = data.type;
        this.show = ko.observable(true);
    };

    // create array for dynamic list
    this.dataList = ko.observableArray([]);

    // add location data to dynamic list
    data.forEach(function(dataItem) {
        self.dataList.push(new Location(dataItem));
    });

    // set values for dropdown/filter menu in index.html
    self.filter = ['Everything', 'Food', 'Movies', 'Arcades', 'Parks'];
    self.selectedFilter = ko.observable(self.filter[0]);
    self.filterLocation = ko.computed(function() {
        var locationList = self.dataList();
        var selectedFilter = self.selectedFilter();
        // loop through list of locations to match filter choice from filter dropdown
        for (var i = 0; i < locationList.length; i++) {
            if (selectedFilter === self.filter[0]) {
                locationList[i].show(true);
                if (marker) {
                    locationList[i].marker.setVisible(true);
                }
            } else if (selectedFilter !== locationList[i].type) {
                locationList[i].show(false);
                locationList[i].marker.setVisible(false);
            } else {
                locationList[i].show(true);
                locationList[i].marker.setVisible(true);
            }
        }

        //  open pop up window when list item is clicked
        self.setPop = function(list) {
            google.maps.event.trigger(list.marker, 'click');
        };
    });
}


var vm = new ViewModel();

// toggle side bar
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
}
