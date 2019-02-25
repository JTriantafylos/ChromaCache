// SUBMIT FORM

$( document ).ready(function() 
{
    $("#searchForm").submit(function(event) 
    {
        $("#resultPalette").empty();

        $("#resultPalette").append("<h1 id=\"loadingMessage\">Finding your palette...</h1>");

        // Prevent the form from submitting via the browser.
        event.preventDefault();

        // Calls the AJAX POSTing function
        ajaxPost();
    });

    function ajaxPost()
    {

        // PREPARE FORM DATA
        var formData = {value: $("#searchID").val()};

        // DO POST
        $.ajax(
            {
                type : "POST",
                contentType : "application/json",
                url : window.location + "api/clientMessage",
                data : JSON.stringify(formData),
                dataType : "json",
                success : function(response) 
                {
                    console.log(JSON.stringify(response));
                },
                error : function(error) 
                {
                    console.error("Error: ", error);
                    console.error("Attempt to send AJAX POST failed!");
                }
            });
    }
});