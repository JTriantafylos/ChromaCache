// SUBMIT FORM

$( document ).ready(function() {
    $('#searchForm').submit(function(event) {
        $('#resultPalette').empty();

        $('#resultPalette').append('<h1 id="loadingMessage">Finding your palette...</h1>');

        // Prevent the form from submitting via the browser.
        event.preventDefault();

        // Calls the AJAX POSTing function
        ajaxPost();
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
                        var fillColor = 'rgb(' + color.red + ', ' + color.green + ', ' + color.blue + ')';

                        $('#resultPalette').append('<svg id="' + id + '" class="paletteElement" xmlns="http://www.w3.org/2000/svg" width="10%" height="196""></svg>');

                        d3.select('#' + id).append('rect')
                            .attr('width', '100%')
                            .attr('height', '196')
                            .attr('style', 'fill:' + fillColor);

                        $('#' + id).prop('title', fillColor);

                        $('.paletteElement').click(function () {
                            var color = $(this).prop('title');
                            $('#title').text(color);
                        });

                        colorCount++;

                    });

                    console.log(JSON.stringify(response));
                },
                error : function(error) {
                    console.error('Error: ', error);
                    console.error('Attempt to send AJAX POST failed!');
                }
            });
    }
});