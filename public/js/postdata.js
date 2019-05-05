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
                    $('#resultPalette').empty();
                    $('#harmony-0').empty();
                    $.each(response[0].colors, function (i, color) {

                        //is all of the subpaletes
                        var subpalette = color.harmonies.subPalettes;
                        
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

                        //click event for element in paletteElement class
                        $('.paletteElement').click(function () {
                            var color = $(this).prop('RGB-output');
                            $('#RGB-output').text(color);
                            
                            //load the harmonies
                        });

                        
                        var complementary = subpalette[0];
                        var triadic = subpalette[1];
                        var analogous = subpalette[2];
                        var tetradic = subpalette[3];
                        var splitcomplementary = subpalette[4];
                        var tintshade = subpalette[5];

                        id = 'complementary-0';
                        RGB = complementary.subColors.subColors[0].RGB;
                        fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                        $('#harmony-'+harmony).append('<svg id="' + id + '" class="paletteElement" xmlns="http://www.w3.org/2000/svg" width="10%" height="90""></svg>');
                        // eslint-disable-next-line no-undef
                        d3.select('#' + id).append('rect')
                            .attr('width', '100%')
                            .attr('height', '90')
                            .attr('style', 'fill:' + fillColor);
                        hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                        outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                            
                        $('#' + id).prop('RGB-output', outputRGB);


                        
                        id = 'complementary-1';
                        RGB = complementary.subColors.subColors[1].RGB;
                        fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                        $('#harmony-'+harmony).append('<svg id="' + id + '" class="paletteElement" xmlns="http://www.w3.org/2000/svg" width="10%" height="90""></svg>');
                        // eslint-disable-next-line no-undef
                        d3.select('#' + id).append('rect')
                            .attr('width', '100%')
                            .attr('height', '90')
                            .attr('style', 'fill:' + fillColor);
                        hexConvert = 'HEX: #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                        outputRGB = hexConvert.toUpperCase()+ ' <-----> '+('RBG: ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2]);
                        
                        $('#' + id).prop('RGB-output', outputRGB);
                        
                        
                        

                        colorCount++;

                    });
                    
                    
                    //load the frequntly searched list
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
                            
                            var id = 'palette-' + colorCount;
                            var RGB= color.RGB;
                            var fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                            var hexConvert = 'HEX   #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16)
                            ;
                            var outputRGB = hexConvert.toUpperCase() +'RBG    ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2];

                            $('#frequent-'+x).append('<svg id="' + id + '" class="paletteElement" xmlns="http://www.w3.org/2000/svg" width="5%" height="90""></svg>');

                            d3.select('#' + id).append('rect')
                                .attr('width', '100%')
                                .attr('height', '90')
                                .attr('style', 'fill:' + fillColor);

                            $('#' + id).prop('RGB-output', outputRGB);

                            colorCount++;
                            

                        });
                    }
              
                },
                error : function(error) {
                    console.error('Error: ', error);
                    console.error('Attempt to send AJAX POST failed!');
                }
            });
    }
});