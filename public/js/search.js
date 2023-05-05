$( document ).ready(function() {
    console.log( 'ready!' );
    $("#search_button").click(function(e){
        e.preventDefault();
        console.log("search button clicked")
        let searchType = $("#searchType").val()
        let searchInput = $("#searchInput").val()

        let search_data = {
            "searchType": searchType,
            "searchInput": searchInput
        }

        $.ajax({
            type: "POST",
            url: "/search",
            data: search_data,
            success: function (response){
                console.log(response)
                if (response.response == null){
                    $("#search_result").html("<p class='center'>No results found</p>")
                } else {
                    $("#search_result").html("<p class='center'>Result: " + response.response + "</p>")
                }

            }})

    })




});