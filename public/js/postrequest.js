$( document ).ready(function() {

    // SUBMIT FORM
    $("#searchForm").submit(function(event) {
        // Prevent the form from submitting via the browser.

        $('#resultPalette').empty();

        $('#resultPalette').append('<h1 id="loadingMessage">Finding your palette...</h1>');

        event.preventDefault();
        ajaxPost();
    });

    function ajaxPost()
    {

        // PREPARE FORM DATA
        var formData = {value : $("#searchID").val()}

        console.log(JSON.stringify(formData));

        // DO POST
        $.ajax(
            {
                type : "POST",
                contentType : "application/json",
                url : window.location + "api/url",
                data : JSON.stringify(formData),
                dataType : 'json',
                success : function(search) {
                    /*
                    $("#postResultDiv").html("<p>" +
                        "Post Successfully! <br>" +
                        "--->" + JSON.stringify(formData.value)+ "</p>");
                    */
                    ajaxGet();
                },
                error : function(e) {
                    alert("Error!")
                    console.log("ERROR: ", e);
                }
            });

        // Reset FormData after Posting
        resetData();

    }

    function resetData()
    {
        $("#searchID").val("");
    }
})
