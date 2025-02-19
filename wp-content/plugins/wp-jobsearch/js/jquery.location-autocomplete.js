var jobsearch_autosugg_ajxreq;
jQuery.fn.extend({
    cityAutocomplete: function (options) {

        if (jobsearch_plugin_vars.locmap_type == 'mapbox') {

            var mapbox_acces_token = jobsearch_plugin_vars.mapbox_token;
            var mapbox_style_url = jobsearch_plugin_vars.mapbox_style;
            if (mapbox_acces_token != '' && mapbox_style_url != '') {

                
            }

        } else {

            return this.each(function () {
                var input = jQuery(this);
                var predictionsDropDown = jQuery('<div class="jobsearch_location_autocomplete" class="city-autocomplete"></div>').appendTo(jQuery(this).parent());
                var request_var = 1;

                input.off('keyup');

                input.on('keyup', function () {

                    jQuery(this).parent(".jobsearch_searchloc_div").find('.loc-loader').html("<i class='fa fa-refresh fa-spin'></i>");
                    if (request_var == 1) {
                        var searchStr = jQuery(this).val();
                        // Min Number of characters
                        var num_of_chars = 0;
                        if (searchStr.length > num_of_chars) {
                            updatePredictions(input);
                        } else {
                            jQuery(".jobsearch_searchloc_div").find('.loc-loader').html('');
                        }
                    }
                });
                predictionsDropDown.delegate('div', 'click', function () {
                    if (jQuery(this).text() != jobsearch_plugin_vars.var_address_str && jQuery(this).text() != jobsearch_plugin_vars.var_other_locs_str) {
                        // address with slug
                        var jobsearch_address_html = jQuery(this).text();
                        // slug only
                        var jobsearch_address_slug = jQuery(this).find('span').html();
                        // remove slug
                        jQuery(this).find('span').remove();
                        input.val(jQuery(this).text());
                        input.trigger('change');
                        input.next('.loc_search_keyword').val(jobsearch_address_slug);
                        predictionsDropDown.hide();
                        input.next('.loc_search_keyword').closest("form.side-loc-srch-form").submit();
                    }
                });
                jQuery(document).mouseup(function (e) {
                    predictionsDropDown.hide();
                });
                jQuery(window).resize(function () {
                    updatePredictionsDropDownDisplay(predictionsDropDown, input);
                });
                updatePredictionsDropDownDisplay(predictionsDropDown, input);
                function updatePredictions(input) {

                    if (typeof jobsearch_autosugg_ajxreq !== undefined && jobsearch_autosugg_ajxreq != undefined) {
                        jobsearch_autosugg_ajxreq.abort();
                    }
                    predictionsDropDown.empty();
                    // AJAX GET Locations
                    var dataString = 'action=jobsearch_get_google_autocomplete_locations&_nonce=' + jobsearch_comon_script_vars.nonce + '&keyword=' + input.val();
                    var plugin_url = jobsearch_plugin_vars.ajax_url;
                    jobsearch_autosugg_ajxreq = jQuery.ajax({
                        type: "POST",
                        url: plugin_url,
                        data: dataString,
                    });

                    jobsearch_autosugg_ajxreq.done(function (data) {
                        jQuery(".jobsearch_searchloc_div").find('.loc-loader').html('');
                        var result = jQuery.parseJSON(data);
                        var loc_results = result.locs;
                        var gloc_results = result.glocs;
                        predictionsDropDown.empty();
                        if (gloc_results != '') {
                            var google_results = '<div class="address_headers"><h5>' + jobsearch_plugin_vars.var_address_str + '</h5></div>';
                            jQuery(gloc_results).each(function (key, value) {
                                google_results += '<div class="jobsearch_google_suggestions"><i class="icon-location-arrow"></i> ' + value + '<span style="display:none">' + value + '</span></div>';
                            });
                            predictionsDropDown.append(google_results);
                        }
                        if (loc_results != '') {
                            predictionsDropDown.append('<div class="address_headers"><h5>' + jobsearch_plugin_vars.var_address_str + '</h5></div>');
                            jQuery(loc_results).each(function (key, value) {
                                if (value.hasOwnProperty('child')) {
                                    jQuery(value.child).each(function (child_key, child_value) {
                                        predictionsDropDown.append('<div class="jobsearch_location_child">' + child_value.value + '<span style="display:none">' + child_value.slug + '</span></div');
                                    })
                                } else {
                                    predictionsDropDown.append('<div class="jobsearch_location_parent">' + value.value + '<span style="display:none">' + value.slug + '</span></div');
                                }
                            });
                        }
                        request_var = 1;
                    });

                    jobsearch_autosugg_ajxreq.fail(function (jqXHR, textStatus) {
                        jQuery(".jobsearch_searchloc_div").find('.loc-loader').html('');
                    });

                    predictionsDropDown.show();
                }
                return input;
            });
        }
    }
});

function updatePredictionsDropDownDisplay(dropDown, input) {
    if (typeof (input.offset()) !== 'undefined') {
        dropDown.css({
            'width': input.outerWidth(),
            'left': input.offset().left,
            'top': input.offset().top + input.outerHeight()
        });
    }
}

function jobsearch_fulladres_to_city_contry(geoData) {
    // debugger;
    var region, countryName, placeName, returnStr;
    if (geoData.context) {
        $.each(geoData.context, function (i, v) {
            if (v.id.indexOf('region') >= 0) {
                region = v.text;
            }
            if (v.id.indexOf('country') >= 0) {
                countryName = v.text;
            }
        });
    }
    if (region && countryName) {
        returnStr = region + ", " + countryName;
    } else {
        returnStr = geoData.place_name;
    }
    return returnStr;
}

jQuery(document).on('click', '.jobsearch_search_location_field', function() {
    jQuery('.jobsearch_search_location_field').cityAutocomplete();
});
jQuery(document).on('click', '.jobsearch_searchloc_div', function () {
    jQuery('.jobsearch_search_location_field').prop('disabled', false);
});
jQuery(document).on('change', '.jobsearch_search_location_field', function () {
    var this_new_loc = jQuery(this).val();

    //if (typeof jobsearch_listing_dataobj !== 'undefined') {
        var locMapType = jobsearch_plugin_vars.locmap_type;
        if (locMapType == 'mapbox') {
            var mapbox_access_token = jobsearch_plugin_vars.mapbox_token;
            var map_addrapi_uri = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURI(this_new_loc) + '.json?access_token=' + mapbox_access_token;
            jobsearch_common_getJSON(map_addrapi_uri, function (new_loc_status, new_loc_response) {
                if (typeof new_loc_response === 'object') {
                    var new_cords = new_loc_response.features[0].geometry.coordinates;
                    if (new_cords !== 'undefined') {
                        jobsearch_listing_map.flyTo({
                            center: new_cords,
                        });
                    }
                }
            });
        } else {
            //console.log(map);
            if (typeof map !== 'undefined') {
                jobsearch_on_google_addr_change_setcenter(map, this_new_loc);
            }
            if (typeof jobsearch_listing_map !== 'undefined') {
                jobsearch_on_google_addr_change_setcenter(jobsearch_listing_map, this_new_loc);
            }
        }
    //}
});

function jobsearch_on_google_addr_change_setcenter(mapobj, new_addr_str) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({address: new_addr_str}, function (results, status) {

        //console.log(status);
        if (status == google.maps.GeocoderStatus.OK) {
            var new_latitude = results[0].geometry.location.lat();
            var new_longitude = results[0].geometry.location.lng();
            if (typeof rand_num !== 'undefined') {
                document.getElementById("jobsearch_location_lat_" + rand_num).value = new_latitude;
                document.getElementById("jobsearch_location_lng_" + rand_num).value = new_longitude;
            }
            //
            mapobj.setCenter(results[0].geometry.location);//center the map over the result

            if (typeof markers !== 'undefined') {
                // clear markers
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }

                //place a marker at the location
                var marker = new google.maps.Marker({
                    map: mapobj,
                    position: results[0].geometry.location,
                    draggable: true,
                    title: '',
                });

                markers.push(marker);

                google.maps.event.addListener(marker, 'dragend', function (event) {
                    if (typeof rand_num !== 'undefined') {
                        document.getElementById("jobsearch_location_lat_" + rand_num).value = this.getPosition().lat();
                        document.getElementById("jobsearch_location_lng_" + rand_num).value = this.getPosition().lng();
                    }
                });
            }
        }
    });
}

jQuery(document).on('click', 'form', function () {
    var src_loc_val = jQuery(this).find('.jobsearch_search_location_field');
    src_loc_val.next('.loc_search_keyword').val(src_loc_val.val());
    //
    if (jQuery('.jobsearch-filter-keywordsrch').length > 0) {
        var srch_keyword_val = jQuery(this).find('.jobsearch-keywordsrch-inp-field').val();
        jQuery('.jobsearch-filter-keywordsrch').find('.jobsearch-keywordsrch-filinp-field').val(srch_keyword_val);
        jQuery('.jobsearch-filter-keywordsrch').find('.jobsearch-keywordsrch-filinp-field').attr('value', srch_keyword_val);
    }
});