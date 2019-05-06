// SUBMIT FORM
$( document ).ready(function() {
    

    $('#searchForm').submit(function(event) {

        //removes the RGB if a new search has been made
        $('#RGB-output').empty();

        // Prevent the form from submitting via the browser.
        event.preventDefault();

        // Checks if the input is alphanumeric
        if ($('#searchID').val().match(/^[a-zA-Z0-9-\s]+$/)){
            // Empties the current result palette
            $('#resultPalette').empty();
            //clear the old harmony responses
            $('#harmony-0').empty();
            $('#harmony-1').empty();
            $('#harmony-2').empty();
            $('#harmony-3').empty();
            $('#harmony-4').empty();
            $('#harmony-5').empty();
            // Displays the loading message
            $('#resultPalette').append('<h1 id="loadingMessage">Finding your palette...</h1>');

            
            // Calls the AJAX POSTing function
            ajaxPost();
        }else{
            $('#searchID').val('Please enter a valid keyword!');
            
        }
    });

    function ajaxPost() {

        // PREPARE FORM DATA (formData = what was searched)
        var formData = {value: $('#searchID').val()};
        
        // DO POST
        $.ajax(
            {
                type : 'POST',
                contentType : 'application/json',
                url : window.location + 'api/clientMessage',
                data : JSON.stringify(formData),
                dataType : 'json',
                success : function(response) {

                    var colorCount = 0;
                    var harmony = 0;
                    var frequencyCount = 0;
                    $('#resultPalette').empty();
                    $.each(response[0].colors, function (i, color) {

                        //is all of the subpaletes
                        var subpalette = color.harmonies.subPalettes;
                        var complementary = subpalette[0];
                        var triadic = subpalette[1];
                        var analogous = subpalette[2];
                        var tetradic = subpalette[3];
                        var splitcomplementary = subpalette[4];
                        var tintshade = subpalette[5];

                        //will be an iterated id for all rectangles in the result palette
                        var id = 'palette-' + colorCount;

                        //RGB color used to define fill-color and a hexadecimal conversion
                        var RGB= color.RGB;
                        var fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                        var hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                        
                        var outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                        
                        //appending a (Scalable Vector Graphic) to the resultPalette span
                        $('#resultPalette').append('<svg id="' + id + '" class="paletteElement" xmlns="http://www.w3.org/2000/svg" width="10%" height="90""></svg>');

                        //defining the attributes to the appended svg
                        // eslint-disable-next-line no-undef
                        d3.select('#' + id).append('rect')
                            .attr('width', '100%')
                            .attr('height', '90')
                            .attr('style', 'fill:' + fillColor);

                        //changing the property of the svg of the given id
                        $('#' + id).prop('RGB-output', outputRGB);

                        //storing the harmonies into the paletteElement properties
                        var harm_RGB = [];
                        for(var t = 0; t<2; t++){
                            RGB = complementary.subColors.subColors[t].RGB;
                            harm_RGB.push(RGB);
                        }
                        $('#' + id).prop('Complementary',harm_RGB); 

                        harm_RGB =[];
                        for(t = 0; t<3; t++){
                            RGB = triadic.subColors.subColors[t].RGB;
                            harm_RGB.push(RGB);
                        }
                        $('#' + id).prop('Triadic',harm_RGB); 

                        harm_RGB =[];
                        for(t = 0; t<3; t++){
                            RGB = analogous.subColors.subColors[t].RGB;
                            harm_RGB.push(RGB);
                        }
                        $('#' + id).prop('Analogous',harm_RGB); 
                        
                        harm_RGB =[];
                        for(t = 0; t<4; t++){
                            RGB = tetradic.subColors.subColors[t].RGB;
                            harm_RGB.push(RGB);
                        }
                        $('#' + id).prop('Tetradic',harm_RGB); 

                        harm_RGB =[];
                        for(t = 0; t<3; t++){
                            RGB = splitcomplementary.subColors.subColors[t].RGB;
                            harm_RGB.push(RGB);
                        }
                        $('#' + id).prop('Split-Complementary',harm_RGB); 

                        harm_RGB =[];
                        for(t = 0; t<7; t++){
                            RGB = tintshade.subColors.subColors[t].RGB;
                            harm_RGB.push(RGB);
                        }
                        $('#' + id).prop('Tint-Shade',harm_RGB); 

                        //click event for element in paletteElement class
                        $('.paletteElement').click(function () {
                            var color = $(this).prop('RGB-output');
                            $('#RGB-output').text(color);
                            
                            
                            //load the harmonies
                            var compl = $(this).prop('Complementary');
                            var triad = $(this).prop('Triadic');
                            var analo = $(this).prop('Analogous');
                            var tetr = $(this).prop('Tetradic');
                            var split = $(this).prop('Split-Complementary');
                            var tint = $(this).prop('Tint-Shade');

                            for(var r = 0; r < compl.length; r++){
                                id = 'complementary-'+r;
                                RGB = compl[r];
                                fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                                $('#harmony-'+harmony).append('<svg id="' + id + '" class="harmonyElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="45""></svg>');
                                // eslint-disable-next-line no-undef
                                d3.select('#' + id).append('rect')
                                    .attr('width', '100%')
                                    .attr('height', '45')
                                    .attr('style', 'fill:' + fillColor);
                                hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                                outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                                    
                                $('#' + id).prop('RGB-output', outputRGB);
                            }
                            harmony++;
                            for(r = 0; r < triad.length; r++){
                                id = 'triadic-'+r;
                                RGB = triad[r];
                                fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                                $('#harmony-'+harmony).append('<svg id="' + id + '" class="harmonyElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="45""></svg>');
                                // eslint-disable-next-line no-undef
                                d3.select('#' + id).append('rect')
                                    .attr('width', '100%')
                                    .attr('height', '45')
                                    .attr('style', 'fill:' + fillColor);
                                hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                                outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                                    
                                $('#' + id).prop('RGB-output', outputRGB);
                            }
                            harmony++;
                            for(r = 0; r < analo.length; r++){
                                id = 'analogous-'+r;
                                RGB = analo[r];
                                fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                                $('#harmony-'+harmony).append('<svg id="' + id + '" class="harmonyElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="45""></svg>');
                                // eslint-disable-next-line no-undef
                                d3.select('#' + id).append('rect')
                                    .attr('width', '100%')
                                    .attr('height', '45')
                                    .attr('style', 'fill:' + fillColor);
                                hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                                outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                                    
                                $('#' + id).prop('RGB-output', outputRGB);
                            }
                            harmony++;
                            for(r = 0; r < tetr.length; r++){
                                id = 'tetradic-'+r;
                                RGB = tetr[r];
                                fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                                $('#harmony-'+harmony).append('<svg id="' + id + '" class="harmonyElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="45""></svg>');
                                // eslint-disable-next-line no-undef
                                d3.select('#' + id).append('rect')
                                    .attr('width', '100%')
                                    .attr('height', '45')
                                    .attr('style', 'fill:' + fillColor);
                                hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                                outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                                    
                                $('#' + id).prop('RGB-output', outputRGB);
                            }
                            harmony++;
                            for(r = 0; r < split.length; r++){
                                id = 'split-complementary-'+r;
                                RGB = split[r];
                                fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                                $('#harmony-'+harmony).append('<svg id="' + id + '" class="harmonyElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="45""></svg>');
                                // eslint-disable-next-line no-undef
                                d3.select('#' + id).append('rect')
                                    .attr('width', '100%')
                                    .attr('height', '45')
                                    .attr('style', 'fill:' + fillColor);
                                hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                                outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                                    
                                $('#' + id).prop('RGB-output', outputRGB);
                            }
                            harmony++;
                            for(r = 0; r < tint.length; r++){
                                id = 'tint-shade-'+r;
                                RGB = tint[r];
                                fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                                $('#harmony-'+harmony).append('<svg id="' + id + '" class="harmonyElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="45""></svg>');
                                // eslint-disable-next-line no-undef
                                d3.select('#' + id).append('rect')
                                    .attr('width', '100%')
                                    .attr('height', '45')
                                    .attr('style', 'fill:' + fillColor);
                                hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                                outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                                    
                                $('#' + id).prop('RGB-output', outputRGB);
                            }


                            $('.harmonyElement').click(function () {
                                var color = $(this).prop('RGB-output');
                                $('#RGB-output').text(color);
                            
                            });
                            
                        });

                        
                        

                        colorCount++;

                    });
                    
                    
                    //load the frequently searched list
                    var frequentList = response[1];
                    for(var x =0; x<frequentList.length;x++){
                        
                        $('#frequent-'+x).empty();
                        $('#frequent-name-'+x).empty();
                        var keyword = frequentList[x].palette.keyword;

                        //capitalizing the first letter
                        
                        if(keyword.length == 1){
                            $('#frequent-name-'+x).append(keyword.charAt(0).toUpperCase());
                            
                        }else{
                            $('#frequent-name-'+x).append(keyword.charAt(0).toUpperCase() + keyword.substring(1));
                            
                        }
                        
                        $.each(frequentList[x].palette.colors, function (i, color) {
                            
                            var id = 'frequency-' + frequencyCount;
                            var RGB= color.RGB;
                            var fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                            var hexConvert = 'HEX   #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16)
                            ;
                            var outputRGB = hexConvert.toUpperCase() +'RBG    ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2];

                            $('#frequent-'+x).append('<svg id="' + id + '" class="frequencyElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="90""></svg>');

                            // eslint-disable-next-line no-undef
                            d3.select('#' + id).append('rect')
                                .attr('width', '100%')
                                .attr('height', '90')
                                .attr('style', 'fill:' + fillColor);

                            $('#' + id).prop('RGB-output', outputRGB);
                            $('#' + id).prop('keyword', keyword);

                            
                            frequencyCount++;
                            

                        });

                    }
                    $('.frequencyElement').click(function () {
                        var key = $(this).prop('keyword');
                        $('#searchID').val(key);
                        $('#searchForm').submit();
                    
                    });
                },
                error : function(error) {
                    console.error('Error: ', error);
                    console.error('Attempt to send AJAX POST failed!');
                }
            });
    }
});