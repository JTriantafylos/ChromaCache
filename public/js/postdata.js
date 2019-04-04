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

        // PREPARE FORM DATA
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

                    $('#resultPalette').empty();
                    $.each(response.colors, function (i, color) {
                        var id = 'palette-' + colorCount;
                        var RGB= color.RGB;
                        var fillColor = 'rgb(' + RGB[0] + ', ' + RGB[1] + ', ' + RGB[2] + ')';
                        var hexConvert = 'HEX   #' + RGB[0].toString(16) + RGB[1].toString(16) + RGB[2].toString(16);
                        var outputRGB = hexConvert.toUpperCase() +'RBG    ' +RGB[0] + ', ' + RGB[1] + ', ' + RGB[2];

                        $('#resultPalette').append('<svg id="' + id + '" class="paletteElement" xmlns="http://www.w3.org/2000/svg" width="10%" height="90""></svg>');

                        d3.select('#' + id).append('rect')
                            .attr('width', '100%')
                            .attr('height', '90')
                            .attr('style', 'fill:' + fillColor);

                        $('#' + id).prop('RGB-output', outputRGB);

                        $('.paletteElement').click(function () {
                            var color = $(this).prop('RGB-output');
                            $('#RGB-output').text(color);
                        });

                        colorCount++;

                    });

                    //console.log(JSON.stringify(response));
                },
                error : function(error) {
                    console.error('Error: ', error);
                    console.error('Attempt to send AJAX POST failed!');
                }
            });
    }
});