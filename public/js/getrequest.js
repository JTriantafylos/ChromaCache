function ajaxGet()
{
    $.ajax({
        type : "GET",
        url : window.location + "api/palette",
        success: function(result)
        {
            var colorCount = 0;

            console.log(JSON.parse(result));

            $('#resultPalette').empty();
            $.each(JSON.parse(result), function(i, color)
                {
                    var id = "palette-" + colorCount;
                    var fillColor = "rgb(" + color.red + ", " + color.green + ", " + color.blue + ")";

                    $('#resultPalette').append('<svg id="' + id + '" class="paletteElement" xmlns="http://www.w3.org/2000/svg" width="10%" height="196""></svg>')

                    var rect = d3.select("#" + id).append("rect")
                        .attr("width", "100%")
                        .attr("height", "196")
                        .attr("style", "fill:" + fillColor);

                    $("#" + id).prop("title", fillColor)

                    $(".paletteElement").click(function() {
                        var color = $(this).prop("title");
                        $("#title").text(color);
                    });

                    colorCount++;

                });

            console.log("Success: ", result);
        },
        error : function(e) {
            $("#getResultDiv").html("<strong>Error</strong>");
            console.log("ERROR: ", e);
        }
    });
}
